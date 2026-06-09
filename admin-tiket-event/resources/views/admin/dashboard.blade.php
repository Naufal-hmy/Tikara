@extends('layouts.admin')

@section('title', 'Dashboard')
@section('header', 'Overview')

@section('content')

<div class="stats-grid">
    <div class="card">
        <div class="stat-label">Total Events</div>
        <div class="stat-value">{{ $eventsCount }}</div>
    </div>
    <div class="card">
        <div class="stat-label">Total Orders</div>
        <div class="stat-value">{{ $ordersCount }}</div>
    </div>
    <div class="card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</div>
    </div>
    <div class="card">
        <div class="stat-label">Users</div>
        <div class="stat-value">{{ $usersCount }}</div>
    </div>
</div>

<div class="card" style="margin-bottom: 2rem;">
    <h3 style="margin-top:0;">Recent Events</h3>
    <table>
        <thead>
            <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Category</th>
                <th>Quota</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($recentEvents as $event)
            <tr>
                <td><strong>{{ $event->title }}</strong></td>
                <td>{{ @strtotime($event->date) ? \Carbon\Carbon::parse($event->date)->format('d M Y') : $event->date }}</td>
                <td><span class="badge badge-primary">{{ $event->category }}</span></td>
                <td>{{ $event->remaining_quota }} / {{ $event->total_quota }}</td>
                <td>
                    @if($event->status == 'published')
                        <span class="badge badge-success">Published</span>
                    @else
                        <span class="badge" style="background:#e5e7eb; color:#374151;">Draft</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>

@endsection
