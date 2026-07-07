@extends('layouts.admin')

@section('title', 'Events from EO')
@section('header', 'Events from EO')

@section('content')

@if(session('success'))
    <div style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-weight: 600;">
        {{ session('success') }}
    </div>
@endif

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <h3 style="margin:0;">Approved/Published Events from EO</h3>
        
        <form action="{{ route('admin.events.eo_approved') }}" method="GET" style="display: flex; gap: 0.5rem; margin: 0; flex: 1; flex-wrap: wrap; align-items: center;">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by title..." style="flex: 1; min-width: 150px; padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none;">
            
            <select name="filter_category" style="padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; background: white;">
                <option value="">All Categories</option>
                @foreach($categories as $cat)
                    <option value="{{ $cat->name }}" {{ request('filter_category') == $cat->name ? 'selected' : '' }}>{{ $cat->name }}</option>
                @endforeach
            </select>

            <select name="filter_location" style="padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; background: white;">
                <option value="">All Locations</option>
                @foreach($locations as $loc)
                    <option value="{{ $loc }}" {{ request('filter_location') == $loc ? 'selected' : '' }}>{{ $loc }}</option>
                @endforeach
            </select>

            <input type="date" name="filter_date" value="{{ request('filter_date') }}" style="padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; color: #374151;">
            
            <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i class="ph ph-magnifying-glass"></i> Filter</button>
            
            @if(request('search') || request('filter_date') || request('filter_category') || request('filter_location'))
                <a href="{{ route('admin.events.eo_approved') }}" class="btn" style="background: #E5E7EB; color: #374151;">Clear</a>
            @endif
        </form>
    </div>

    <table>
        <thead>
            <tr>
                <th>Poster</th>
                <th>EO Name</th>
                <th>Title & Info</th>
                <th>Location</th>
                <th>Price</th>
                <th>Quota</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($events as $event)
            <tr>
                <td>
                    @if($event->image_url)
                        <img src="{{ $event->image_url }}" alt="Poster" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.5rem;">
                    @else
                        <div style="width: 50px; height: 50px; background: #E5E7EB; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #9CA3AF;"><i class="ph ph-image"></i></div>
                    @endif
                </td>
                <td>
                    <strong>{{ $event->eo ? $event->eo->full_name : 'Unknown' }}</strong><br>
                    <small style="color: var(--text-muted);">{{ $event->eo && $event->eo->phone_number ? $event->eo->phone_number : '-' }}</small>
                </td>
                <td>
                    <strong>{{ $event->title }}</strong><br>
                    <small style="color: var(--text-muted);">{{ @strtotime($event->date) ? \Carbon\Carbon::parse($event->date)->format('d M Y') : $event->date }} | {{ $event->category }}</small>
                </td>
                <td>{{ $event->location }}</td>
                <td>Rp {{ number_format($event->price, 0, ',', '.') }}</td>
                <td>{{ $event->remaining_quota }} / {{ $event->total_quota }}</td>
                <td>
                    @if($event->status == 'canceled')
                        <span class="badge" style="background:#FEE2E2; color:#991B1B;"><span style="display:inline-block; width:8px; height:8px; background:#DC2626; border-radius:50%; margin-right:4px;"></span>Canceled</span>
                    @elseif($event->status == 'draft')
                        <span class="badge" style="background:#FEF3C7; color:#92400E;"><span style="display:inline-block; width:8px; height:8px; background:#F59E0B; border-radius:50%; margin-right:4px;"></span>Draft</span>
                    @else
                        @php
                            $eventDate = \Carbon\Carbon::parse($event->date)->startOfDay();
                            $today = \Carbon\Carbon::now()->startOfDay();
                        @endphp
                        @if($eventDate->isBefore($today))
                            <span class="badge" style="background:#F3F4F6; color:#4B5563;"><span style="display:inline-block; width:8px; height:8px; background:#EF4444; border-radius:50%; margin-right:4px;"></span>Published (Past)</span>
                        @else
                            <span class="badge" style="background:#D1FAE5; color:#065F46;"><span style="display:inline-block; width:8px; height:8px; background:#10B981; border-radius:50%; margin-right:4px;"></span>Published (Upcoming)</span>
                        @endif
                    @endif
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <a href="{{ route('admin.events.edit', $event->id) }}" style="color: var(--primary-color); text-decoration: none;"><i class="ph ph-pencil-simple"></i> Edit</a>
                        
                        <form action="{{ route('admin.events.destroy', $event->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this event?');" style="margin:0;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" style="background: none; border: none; color: #DC2626; cursor: pointer; padding: 0; font-size: 1rem; text-decoration: underline;"><i class="ph ph-trash"></i> Delete</button>
                        </form>
                    </div>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 1.5rem;">
        {{ $events->links() }}
    </div>
</div>

@endsection
