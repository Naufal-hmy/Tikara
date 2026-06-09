@extends('layouts.admin')

@section('title', 'Manage Users')
@section('header', 'Manage Users')

@section('content')

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin:0;">Registered Users</h3>
    </div>

    <table>
        <thead>
            <tr>
                <th>User ID (UUID)</th>
                <th>Balance</th>
                <th>Role</th>
                <th>Joined</th>
            </tr>
        </thead>
        <tbody>
            @foreach($users as $user)
            <tr>
                <td style="font-family: monospace;">{{ $user->id }}</td>
                <td>Rp {{ number_format($user->balance, 0, ',', '.') }}</td>
                <td>
                    @if($user->role == 'admin')
                        <span class="badge badge-primary">Admin</span>
                    @else
                        <span class="badge" style="background:#E5E7EB; color:#374151;">User</span>
                    @endif
                </td>
                <td><small>{{ $user->created_at ? $user->created_at->format('d M Y') : '-' }}</small></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 1.5rem;">
        {{ $users->links() }}
    </div>
</div>

@endsection
