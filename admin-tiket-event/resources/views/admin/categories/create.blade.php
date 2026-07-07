@extends('layouts.admin')

@section('title', 'Add Category')
@section('header', 'Add Category')

@section('content')

<div class="card" style="max-width: 600px;">
    @if ($errors->any())
        <div style="background: rgba(239, 68, 68, 0.1); color: #B91C1C; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <ul style="margin: 0; padding-left: 1.5rem;">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('admin.categories.store') }}" method="POST">
        @csrf
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Category Name</label>
            <input type="text" name="name" value="{{ old('name') }}" required placeholder="e.g. Music, Technology, Workshop" style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary">Save Category</button>
            <a href="{{ route('admin.categories.index') }}" class="btn" style="background: #E5E7EB; color: #374151;">Cancel</a>
        </div>
    </form>
</div>

@endsection
