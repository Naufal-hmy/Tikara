@extends('layouts.admin')

@section('title', 'Add New Event')
@section('header', 'Add New Event')

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

    <form action="{{ route('admin.events.store') }}" method="POST" enctype="multipart/form-data">
        @csrf
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Title</label>
                <input type="text" name="title" value="{{ old('title') }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Category</label>
                <input type="text" name="category" value="{{ old('category') }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Date</label>
                <input type="date" name="date" value="{{ old('date') }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Time (e.g. 19:00 WIB)</label>
                <input type="text" name="time" value="{{ old('time') }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            
            <div style="grid-column: span 2;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Location</label>
                <input type="text" name="location" value="{{ old('location') }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div style="grid-column: span 2;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Address Detail</label>
                <textarea name="address_detail" rows="3" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">{{ old('address_detail') }}</textarea>
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Price (Rp)</label>
                <input type="number" name="price" value="{{ old('price', 0) }}" min="0" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Total Quota</label>
                <input type="number" name="total_quota" value="{{ old('total_quota', 100) }}" min="1" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
                <input type="hidden" name="remaining_quota" value="{{ old('total_quota', 100) }}">
            </div>
            
            <div style="grid-column: span 2;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Description</label>
                <textarea name="description" rows="5" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">{{ old('description') }}</textarea>
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Event Poster (Image)</label>
                <input type="file" name="image" accept="image/*" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box; background: white;">
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Status</label>
                <select name="status" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box; background: white;">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary">Save Event</button>
            <a href="{{ route('admin.events.index') }}" class="btn" style="background: #E5E7EB; color: #374151;">Cancel</a>
        </div>
    </form>
</div>

<script>
    // Sinkronisasi otomatis Total Quota ke Remaining Quota jika event baru
    document.querySelector('input[name="total_quota"]').addEventListener('input', function(e) {
        document.querySelector('input[name="remaining_quota"]').value = e.target.value;
    });
</script>

@endsection
