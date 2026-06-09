@extends('layouts.admin')

@section('title', 'Manage Events')
@section('header', 'Manage Events')

@section('content')

@if(session('success'))
    <div style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-weight: 600;">
        {{ session('success') }}
    </div>
@endif

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin:0;">All Events</h3>
        <a href="{{ route('admin.events.create') }}" class="btn btn-primary"><i class="ph ph-plus"></i> Add New Event</a>
    </div>

    <table>
        <thead>
            <tr>
                <th>Poster</th>
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
                    <strong>{{ $event->title }}</strong><br>
                    <small style="color: var(--text-muted);">{{ @strtotime($event->date) ? \Carbon\Carbon::parse($event->date)->format('d M Y') : $event->date }} | {{ $event->category }}</small>
                </td>
                <td>{{ $event->location }}</td>
                <td>Rp {{ number_format($event->price, 0, ',', '.') }}</td>
                <td>{{ $event->remaining_quota }} / {{ $event->total_quota }}</td>
                <td>
                    @if($event->status == 'published')
                        <span class="badge badge-success">Published</span>
                    @else
                        <span class="badge" style="background:#e5e7eb; color:#374151;">Draft</span>
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
