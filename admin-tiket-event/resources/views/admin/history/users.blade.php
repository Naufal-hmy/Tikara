@extends('layouts.admin')

@section('title', 'History Akun')
@section('header', 'History Akun')

@section('content')

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <h3 style="margin:0;">Activity Logs: Users</h3>

        <form action="{{ route('admin.history.users') }}" method="GET" style="display: flex; gap: 0.5rem; margin: 0; flex: 1; flex-wrap: wrap; align-items: center;">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Search description..." style="flex: 1; min-width: 150px; padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none;">
            
            <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i class="ph ph-magnifying-glass"></i> Search</button>
            
            @if(request('search'))
                <a href="{{ route('admin.history.users') }}" class="btn" style="background: #E5E7EB; color: #374151;">Clear</a>
            @endif
        </form>
    </div>

    <div style="overflow-x: auto;">
        <table>
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>Subjek (ID)</th>
                    <th>Dilakukan Oleh</th>
                    <th>Aksi</th>
                    <th>Deskripsi Perubahan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($activities as $activity)
                <tr>
                    <td>{{ $activity->created_at->format('d M Y, H:i') }}</td>
                    <td style="font-family: monospace;">{{ $activity->subject_id }}</td>
                    <td>{{ $activity->causer ? ($activity->causer->name ?? $activity->causer->full_name ?? 'Unknown') : 'System' }}</td>
                    <td>
                        @if($activity->description == 'created')
                            <span class="badge badge-success" style="background: #D1FAE5; color: #065F46;">Created</span>
                        @elseif($activity->description == 'updated')
                            <span class="badge badge-warning" style="background: #FEF3C7; color: #D97706;">Updated</span>
                        @elseif($activity->description == 'deleted')
                            <span class="badge badge-danger" style="background: #FEE2E2; color: #B91C1C;">Deleted</span>
                        @else
                            <span class="badge badge-primary">{{ ucfirst($activity->description) }}</span>
                        @endif
                    </td>
                    <td>
                        <div style="max-height: 100px; overflow-y: auto; font-size: 0.85rem; background: #F3F4F6; padding: 0.5rem; border-radius: 0.25rem;">
                            @if(isset($activity->properties['attributes']))
                                <strong>Data:</strong><br>
                                @foreach($activity->properties['attributes'] as $key => $value)
                                    @if(is_array($value))
                                        {{ $key }}: {{ json_encode($value) }}<br>
                                    @else
                                        {{ $key }}: {{ $value }}<br>
                                    @endif
                                @endforeach
                            @else
                                {{ json_encode($activity->properties) }}
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem; color: #6B7280;">Belum ada log aktivitas untuk User.</td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($activities->hasPages())
        <div style="margin-top: 1.5rem;">
            {{ $activities->links() }}
        </div>
    @endif
</div>

@endsection
