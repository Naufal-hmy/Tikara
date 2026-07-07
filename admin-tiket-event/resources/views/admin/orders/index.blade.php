@extends('layouts.admin')

@section('title', 'Manage Orders')
@section('header', 'Manage Orders')

@section('content')

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <h3 style="margin:0;">All Orders / Transactions</h3>

        <form action="{{ route('admin.orders.index') }}" method="GET" style="display: flex; gap: 0.5rem; margin: 0; flex: 1; flex-wrap: wrap; align-items: center; width: 100%;">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="Order ID, User ID, Event..." style="flex: 1; min-width: 150px; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none;">
            
            <select name="filter_status" style="padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; background: white;">
                <option value="">All Status</option>
                <option value="success" {{ request('filter_status') == 'success' ? 'selected' : '' }}>Success</option>
                <option value="pending" {{ request('filter_status') == 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="failed" {{ request('filter_status') == 'failed' ? 'selected' : '' }}>Failed</option>
                <option value="canceled" {{ request('filter_status') == 'canceled' ? 'selected' : '' }}>Canceled</option>
            </select>

            <select name="filter_checkin" style="padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; background: white;">
                <option value="">Check-In: All</option>
                <option value="yes" {{ request('filter_checkin') == 'yes' ? 'selected' : '' }}>Yes</option>
                <option value="no" {{ request('filter_checkin') == 'no' ? 'selected' : '' }}>No</option>
            </select>

            <input type="number" name="filter_quantity" value="{{ request('filter_quantity') }}" placeholder="Qty" style="width: 70px; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none;">
            
            <input type="number" name="filter_price" value="{{ request('filter_price') }}" placeholder="Price (Rp)" style="width: 120px; padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none;">

            <input type="date" name="filter_date" value="{{ request('filter_date') }}" style="padding: 0.5rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; outline: none; color: #374151;">
            
            <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i class="ph ph-magnifying-glass"></i> Filter</button>
            
            @if(request()->except('page'))
                <a href="{{ route('admin.orders.index') }}" class="btn" style="background: #E5E7EB; color: #374151;">Clear</a>
            @endif
        </form>
    </div>

    <table>
        <thead>
            <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Event</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
            <tr>
                <td style="font-family: monospace;">#{{ substr($order->id, 0, 8) }}...</td>
                <td><small style="color:var(--text-muted);">{{ substr($order->user_id, 0, 8) }}...</small></td>
                <td>{{ $order->event ? $order->event->title : 'Event Not Found' }}</td>
                <td>{{ $order->quantity }} Ticket(s)</td>
                <td>Rp {{ number_format($order->total_price, 0, ',', '.') }}</td>
                <td>
                    @if($order->status == 'success')
                        <span class="badge badge-success">Success</span>
                    @else
                        <span class="badge" style="background:#FEF3C7; color:#D97706;">{{ ucfirst($order->status) }}</span>
                    @endif
                </td>
                <td>
                    @if($order->is_checked_in)
                        <span style="color: #059669; font-weight:600;"><i class="ph ph-check-circle"></i> Yes</span>
                    @else
                        <span style="color: #9CA3AF;"><i class="ph ph-x-circle"></i> No</span>
                    @endif
                </td>
                <td><small>{{ $order->created_at->format('d M Y, H:i') }}</small></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 1.5rem;">
        {{ $orders->links() }}
    </div>
</div>

@endsection
