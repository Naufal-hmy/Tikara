@extends('layouts.admin')

@section('title', 'Manage Users')
@section('header', 'Manage Users')

@section('content')

<div class="card">
    @if(session('success'))
        <div style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-weight: 600;">
            {{ session('success') }}
        </div>
    @endif

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <h3 style="margin:0;">Registered Users</h3>
            <a href="{{ route('admin.users.create') }}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                <i class="ph ph-plus"></i> Add User
            </a>
        </div>

        <form action="{{ route('admin.users.index') }}" method="GET" style="display: flex; gap: 0.5rem; margin: 0; flex: 1; flex-wrap: wrap; align-items: center;">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by ID, Name or Email..." style="flex: 1; min-width: 150px; padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none;">
            
            <select name="filter_role" style="padding: 0.5rem 1rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; background: white; color: #374151;">
                <option value="">All Roles</option>
                <option value="user" {{ request('filter_role') == 'user' ? 'selected' : '' }}>User</option>
                <option value="eo" {{ request('filter_role') == 'eo' ? 'selected' : '' }}>Event Organizer</option>
                <option value="admin" {{ request('filter_role') == 'admin' ? 'selected' : '' }}>Admin</option>
            </select>

            <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i class="ph ph-magnifying-glass"></i> Search</button>
            
            @if(request('search') || request('filter_role'))
                <a href="{{ route('admin.users.index') }}" class="btn" style="background: #E5E7EB; color: #374151;">Clear</a>
            @endif
        </form>
    </div>

    <table>
        <thead>
            <tr>
                <th>User ID (UUID)</th>
                <th>Name</th>
                <th>Balance</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($users as $user)
            <tr>
                <td style="font-family: monospace;">{{ $user->id }}</td>
                <td><strong>{{ $user->full_name ?? '-' }}</strong></td>
                <td>Rp {{ number_format($user->balance, 0, ',', '.') }}</td>
                <td>
                    @if($user->role == 'admin')
                        <span class="badge badge-primary">Admin</span>
                    @elseif($user->role == 'eo')
                        <span class="badge" style="background:#FEF3C7; color:#D97706;">Event Organizer</span>
                    @else
                        <span class="badge" style="background:#E5E7EB; color:#374151;">User</span>
                    @endif
                </td>
                <td><small>{{ $user->created_at ? $user->created_at->format('d M Y') : '-' }}</small></td>
                <td>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <a href="{{ route('admin.users.edit', $user->id) }}" style="color: var(--primary-color); text-decoration: none;"><i class="ph ph-pencil-simple"></i> Edit</a>
                        
                        <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this user profile?');" style="margin:0;">
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
        {{ $users->links() }}
    </div>
</div>

@endsection
