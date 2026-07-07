<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Event;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::whereNull('eo_id');

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where('title', 'like', '%' . $searchTerm . '%');
        }

        if ($request->has('filter_date') && $request->filter_date != '') {
            $query->whereDate('date', $request->filter_date);
        }

        if ($request->has('filter_category') && $request->filter_category != '') {
            $query->where('category', $request->filter_category);
        }

        if ($request->has('filter_location') && $request->filter_location != '') {
            $query->where('location', $request->filter_location);
        }

        $events = $query->orderBy('date', 'desc')->paginate(10)->appends($request->query());
        $categories = \App\Models\Category::orderBy('name')->get();
        $locations = Event::select('location')->distinct()->orderBy('location')->pluck('location');

        return view('admin.events.index', compact('events', 'categories', 'locations'));
    }

    public function create()
    {
        $categories = \App\Models\Category::orderBy('name')->get();
        return view('admin.events.create', compact('categories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => [
                'required', 'string', 'max:255',
                \Illuminate\Validation\Rule::unique('events')->where(function ($query) use ($request) {
                    return $query->where('date', $request->date);
                })
            ],
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'time' => 'required|string|max:50',
            'location' => 'required|string|max:255',
            'address_detail' => 'required|string',
            'price' => 'required|numeric|min:0',
            'total_quota' => 'required|integer|min:0',
            'status' => 'required|in:published,draft,canceled,pending,rejected',
            'description' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ], [
            'title.unique' => 'An event with this title already exists on the selected date.'
        ]);

        $imagePath = $request->file('image')->store('events', 'public');
        $imageUrl = asset('storage/' . $imagePath);

        $validated['remaining_quota'] = $validated['total_quota'];
        Event::create(array_merge($validated, ['image_url' => $imageUrl]));

        return redirect()->route('admin.events.index')->with('success', 'Event created successfully.');
    }

    public function edit(Event $event)
    {
        $categories = \App\Models\Category::orderBy('name')->get();
        return view('admin.events.edit', compact('event', 'categories'));
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => [
                'required', 'string', 'max:255',
                \Illuminate\Validation\Rule::unique('events')->where(function ($query) use ($request) {
                    return $query->where('date', $request->date);
                })->ignore($event->id)
            ],
            'category' => 'required|string|max:100',
            'date' => 'required|date',
            'time' => 'required|string|max:50',
            'location' => 'required|string|max:255',
            'address_detail' => 'required|string',
            'price' => 'required|numeric|min:0',
            'total_quota' => 'required|integer|min:0',
            'status' => 'required|in:published,draft,canceled,pending,rejected',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ], [
            'title.unique' => 'An event with this title already exists on the selected date.'
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events', 'public');
            $validated['image_url'] = asset('storage/' . $imagePath);
        }

        // Calculate new remaining quota based on total quota change
        $quotaDifference = $validated['total_quota'] - $event->total_quota;
        $validated['remaining_quota'] = $event->remaining_quota + $quotaDifference;

        // Prevent negative remaining quota if admin reduces total below sold tickets
        if ($validated['remaining_quota'] < 0) {
            return back()->withErrors(['total_quota' => 'Total quota cannot be reduced below the number of tickets already sold.']);
        }

        $event->update($validated);

        return redirect()->route('admin.events.index')->with('success', 'Event updated successfully.');
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return back()->with('success', 'Event deleted successfully.');
    }

    public function eoEvents(Request $request)
    {
        $query = Event::with('eo')->whereNotNull('eo_id')->whereIn('status', ['pending', 'rejected']);

        if ($request->has('search') && $request->search != '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $events = $query->orderBy('created_at', 'desc')->paginate(15)->appends($request->query());
        return view('admin.events.eo', compact('events'));
    }

    public function approvedEoEvents(Request $request)
    {
        $query = Event::with('eo')->whereNotNull('eo_id')->whereNotIn('status', ['pending', 'rejected']);

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('eo', function($qeo) use ($searchTerm) {
                      $qeo->where('full_name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        if ($request->has('filter_date') && $request->filter_date != '') {
            $query->whereDate('date', $request->filter_date);
        }

        if ($request->has('filter_category') && $request->filter_category != '') {
            $query->where('category', $request->filter_category);
        }

        if ($request->has('filter_location') && $request->filter_location != '') {
            $query->where('location', $request->filter_location);
        }

        $events = $query->orderBy('date', 'desc')->paginate(10)->appends($request->query());
        $categories = \App\Models\Category::orderBy('name')->get();
        $locations = Event::whereNotNull('eo_id')->whereNotIn('status', ['pending', 'rejected'])->select('location')->distinct()->orderBy('location')->pluck('location');

        return view('admin.events.eo_approved', compact('events', 'categories', 'locations'));
    }

    public function approve(Event $event)
    {
        $event->update(['status' => 'published']);
        return redirect()->back()->with('success', 'Event approved and published.');
    }

    public function reject(Event $event)
    {
        $event->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Event has been rejected.');
    }
}
