@extends('layouts.admin')

@section('title', 'Edit Event')
@section('header', 'Edit Event: ' . $event->title)

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

    <form action="{{ route('admin.events.update', $event->id) }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT')
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Title</label>
                <input type="text" name="title" value="{{ old('title', $event->title) }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Category</label>
                <input type="text" name="category" value="{{ old('category', $event->category) }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Date</label>
                <input type="date" name="date" value="{{ old('date', \Carbon\Carbon::parse($event->date)->format('Y-m-d')) }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Time</label>
                <input type="text" name="time" value="{{ old('time', $event->time) }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            
            <div style="grid-column: span 2;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Location</label>
                <input type="text" name="location" value="{{ old('location', $event->location) }}" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div style="grid-column: span 2;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Address Detail</label>
                <textarea name="address_detail" rows="3" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">{{ old('address_detail', $event->address_detail) }}</textarea>
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Price (Rp)</label>
                <input type="number" name="price" value="{{ old('price', $event->price) }}" min="0" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Total Quota</label>
                <input type="number" name="total_quota" value="{{ old('total_quota', $event->total_quota) }}" min="1" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Remaining Quota</label>
                <input type="number" name="remaining_quota" value="{{ old('remaining_quota', $event->remaining_quota) }}" min="0" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">
            </div>
            <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Status</label>
                <select name="status" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box; background: white;">
                    <option value="published" {{ old('status', $event->status) == 'published' ? 'selected' : '' }}>Published</option>
                    <option value="draft" {{ old('status', $event->status) == 'draft' ? 'selected' : '' }}>Draft</option>
                </select>
            </div>
            
            <div style="grid-column: span 2;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Description</label>
                <textarea name="description" rows="5" required style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box;">{{ old('description', $event->description) }}</textarea>
            </div>
            
            <div style="grid-column: span 2;">
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Event Poster (Image) - <em>Leave empty to keep current image</em></label>
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                    @if($event->image_url)
                        <img src="{{ $event->image_url }}" alt="Current Poster" style="width: 100px; height: 100px; object-fit: cover; border-radius: 0.5rem; border: 1px solid #D1D5DB;">
                    @endif
                    <input type="file" name="image" accept="image/*" style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-sizing: border-box; background: white;">
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary">Update Event</button>
            <a href="{{ route('admin.events.index') }}" class="btn" style="background: #E5E7EB; color: #374151;">Cancel</a>
        </div>
    </form>
</div>

@endsection
