<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $query = Profile::query();

        if ($request->has('search') && $request->search != '') {
            $query->where('id', 'like', '%' . $request->search . '%')
                  ->orWhere('full_name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('filter_role') && $request->filter_role != '') {
            $query->where('role', $request->filter_role);
        }

        $users = $query->paginate(15)->appends($request->query());
        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        return view('admin.users.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|min:6',
            'role' => 'required|in:user,eo,admin'
        ]);

        $supabaseUrl = config('services.supabase.url');
        $supabaseKey = config('services.supabase.service_role_key');

        if (!$supabaseUrl || !$supabaseKey) {
            return back()->withInput()->with('error', 'Supabase configuration is missing. Cannot create user.');
        }

        // Call Supabase Admin API
        $response = \Illuminate\Support\Facades\Http::withoutVerifying()->withHeaders([
            'apikey' => $supabaseKey,
            'Authorization' => 'Bearer ' . $supabaseKey,
        ])->post($supabaseUrl . '/auth/v1/admin/users', [
            'email' => $validated['email'],
            'password' => $validated['password'],
            'email_confirm' => true,
        ]);

        if ($response->failed()) {
            $error = $response->json();
            $errorMessage = $error['msg'] ?? $error['message'] ?? 'Failed to create user in Supabase.';
            return back()->withInput()->with('error', $errorMessage);
        }

        $supabaseUser = $response->json();
        $uuid = $supabaseUser['id'];

        // Update or Create Profile locally (handle Supabase Trigger)
        Profile::updateOrCreate(
            ['id' => $uuid],
            [
                'full_name' => $validated['full_name'],
                'role' => $validated['role'],
                'balance' => 0
            ]
        );

        return redirect()->route('admin.users.index')->with('success', 'User has been successfully created.');
    }

    public function edit(Profile $user)
    {
        return view('admin.users.edit', compact('user'));
    }

    public function update(Request $request, Profile $user)
    {
        $validated = $request->validate([
            'balance' => 'required|numeric|min:0',
            'role' => 'required|string|in:user,admin,eo'
        ]);

        $user->update($validated);

        return redirect()->route('admin.users.index')->with('success', 'Profile updated successfully.');
    }

    public function destroy(Profile $user)
    {
        $user->delete();
        return back()->with('success', 'Profile deleted successfully.');
    }
}
