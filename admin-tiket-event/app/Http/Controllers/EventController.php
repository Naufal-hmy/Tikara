<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Event;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::orderBy('created_at', 'desc')->paginate(10);
        return view('admin.events.index', compact('events'));
    }

    public function create()
    {
        return view('admin.events.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'time' => 'required|string|max:50',
            'location' => 'required|string|max:255',
            'address_detail' => 'required|string',
            'price' => 'required|numeric|min:0',
            'remaining_quota' => 'required|integer|min:0',
            'total_quota' => 'required|integer|min:0',
            'status' => 'required|in:published,draft',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $imagePath = $request->file('image')->store('events', 'public');
        $imageUrl = asset('storage/' . $imagePath);

        Event::create(array_merge($validated, ['image_url' => $imageUrl]));

        return redirect()->route('admin.events.index')->with('success', 'Event created successfully.');
    }

    public function edit(Event $event)
    {
        return view('admin.events.edit', compact('event'));
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'time' => 'required|string|max:50',
            'location' => 'required|string|max:255',
            'address_detail' => 'required|string',
            'price' => 'required|numeric|min:0',
            'remaining_quota' => 'required|integer|min:0',
            'total_quota' => 'required|integer|min:0',
            'status' => 'required|in:published,draft',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events', 'public');
            $validated['image_url'] = asset('storage/' . $imagePath);
        }

        $event->update($validated);

        return redirect()->route('admin.events.index')->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return redirect()->route('admin.events.index')->with('success', 'Event deleted successfully.');
    }
}
