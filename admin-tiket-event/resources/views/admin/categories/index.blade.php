@extends('layouts.admin')

@section('title', 'Manage Categories')
@section('header', 'Manage Categories')

@section('content')

<div class="card">
    @if(session('success'))
        <div style="background: rgba(16, 185, 129, 0.1); color: #059669; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-weight: 600;">
            {{ session('success') }}
        </div>
    @endif

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin:0;">All Categories</h3>
        <a href="{{ route('admin.categories.create') }}" class="btn btn-primary"><i class="ph ph-plus"></i> Add New Category</a>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Created At</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($categories as $category)
            <tr>
                <td>{{ $category->id }}</td>
                <td style="font-weight: 600;">{{ $category->name }}</td>
                <td><small style="color:var(--text-muted);">{{ $category->slug }}</small></td>
                <td><small>{{ $category->created_at->format('d M Y') }}</small></td>
                <td>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <a href="{{ route('admin.categories.edit', $category->id) }}" style="color: var(--primary-color); text-decoration: none;"><i class="ph ph-pencil-simple"></i> Edit</a>
                        
                        <form action="{{ route('admin.categories.destroy', $category->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this category?');" style="margin:0;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" style="background: none; border: none; color: #DC2626; cursor: pointer; padding: 0; font-size: 1rem; text-decoration: underline;"><i class="ph ph-trash"></i> Delete</button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No categories found.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 1.5rem;">
        {{ $categories->links() }}
    </div>
</div>

@endsection
