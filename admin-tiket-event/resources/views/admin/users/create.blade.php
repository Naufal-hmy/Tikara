@extends('layouts.admin')

@section('content')
<div class="card" style="max-width: 600px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin:0;">Add New User / EO</h3>
        <a href="{{ route('admin.users.index') }}" class="btn" style="background: #E5E7EB; color: #374151;">Back</a>
    </div>

    @if ($errors->any())
        <div style="background: #FEE2E2; color: #991B1B; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <ul style="margin: 0; padding-left: 1.5rem;">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if (session('error'))
        <div style="background: #FEE2E2; color: #991B1B; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            {{ session('error') }}
        </div>
    @endif

    <form action="{{ route('admin.users.store') }}" method="POST">
        @csrf
        <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Full Name</label>
            <input type="text" name="full_name" class="form-control" value="{{ old('full_name') }}" required style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem;">
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email Address</label>
            <input type="email" name="email" class="form-control" value="{{ old('email') }}" required style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem;">
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password (Min. 6 characters)</label>
            <input type="password" name="password" class="form-control" required minlength="6" style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem;">
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Role</label>
            <select name="role" class="form-control" required style="width: 100%; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; background: white;">
                <option value="user" {{ old('role') == 'user' ? 'selected' : '' }}>User</option>
                <option value="eo" {{ old('role') == 'eo' ? 'selected' : '' }}>Event Organizer (EO)</option>
                <option value="admin" {{ old('role') == 'admin' ? 'selected' : '' }}>Admin</option>
            </select>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">Create Account</button>
    </form>
</div>
@endsection
