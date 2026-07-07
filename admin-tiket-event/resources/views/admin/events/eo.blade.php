@extends('layouts.admin')

@section('title', 'Approval Event EO')
@section('header', 'Approval Event EO')

@section('content')

@if(session('success'))
    <div style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-weight: 600;">
        {{ session('success') }}
    </div>
@endif

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <h3 style="margin:0;">Pending Approval Events from EO</h3>
        
        <form action="{{ route('admin.events.eo') }}" method="GET" style="display: flex; gap: 0.5rem; margin: 0; flex: 1; flex-wrap: wrap; align-items: center;">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by title..." style="flex: 1; min-width: 150px; padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none;">
            
            <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i class="ph ph-magnifying-glass"></i> Search</button>
            
            @if(request('search'))
                <a href="{{ route('admin.events.eo') }}" class="btn" style="background: #E5E7EB; color: #374151;">Clear</a>
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
                <td>
                    @if($event->status == 'pending')
                        <span class="badge" style="background:#DBEAFE; color:#1D4ED8;">Pending</span>
                    @elseif($event->status == 'rejected')
                        <span class="badge" style="background:#FEE2E2; color:#991B1B;">Rejected</span>
                    @endif
                </td>
                <td>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        @if($event->status == 'pending')
                            <form action="{{ route('admin.events.approve', $event->id) }}" method="POST" onsubmit="return confirm('Approve this event?');" style="margin:0;">
                                @csrf
                                <button type="submit" style="background: none; border: none; color: #059669; cursor: pointer; padding: 0; font-size: 1rem; text-decoration: underline;"><i class="ph ph-check-circle"></i> Approve</button>
                            </form>
                            <form action="{{ route('admin.events.reject', $event->id) }}" method="POST" onsubmit="return confirm('Reject this event?');" style="margin:0;">
                                @csrf
                                <button type="submit" style="background: none; border: none; color: #DC2626; cursor: pointer; padding: 0; font-size: 1rem; text-decoration: underline;"><i class="ph ph-x-circle"></i> Reject</button>
                            </form>
                        @endif
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
