@extends('layouts.admin')

@section('title', 'Manage Orders')
@section('header', 'Manage Orders')

@section('content')

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin:0;">All Orders / Transactions</h3>
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
                <td>#{{ $order->id }}</td>
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
