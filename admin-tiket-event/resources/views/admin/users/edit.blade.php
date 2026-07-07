@extends('layouts.admin')

@section('title', 'Edit User Profile')
@section('header', 'Edit User Profile')

@section('content')

<div class="card">
    @if ($errors->any())
        <div style="background: rgba(239, 68, 68, 0.1); color: #B91C1C; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <ul style="margin: 0; padding-left: 1.5rem;">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('admin.users.update', $user->id) }}" method="POST">
        @csrf
        @method('PUT')
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 1.5rem; max-width: 600px;">
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">User ID (UUID)</label>
                <input type="text" value="{{ $user->id }}" disabled style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box; background: #F3F4F6; color: #6B7280; font-family: monospace;">
                <small style="color: var(--text-muted); display: block; margin-top: 0.25rem;">User ID cannot be changed.</small>
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Balance (Rp)</label>
                <input type="number" name="balance" value="{{ old('balance', $user->balance) }}" min="0" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>

            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Role</label>
                <select name="role" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box; background: white;">
                    <option value="user" {{ old('role', $user->role) == 'user' ? 'selected' : '' }}>User</option>
                    <option value="eo" {{ old('role', $user->role) == 'eo' ? 'selected' : '' }}>Event Organizer (EO)</option>
                    <option value="admin" {{ old('role', $user->role) == 'admin' ? 'selected' : '' }}>Admin</option>
                </select>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary">Update Profile</button>
            <a href="{{ route('admin.users.index') }}" class="btn" style="background: #E5E7EB; color: #374151;">Cancel</a>
        </div>
    </form>
</div>

@endsection
