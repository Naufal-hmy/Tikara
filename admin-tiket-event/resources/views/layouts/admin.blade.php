<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Panel') - Tikara</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('css/admin.css') }}">
    <!-- Phosphor Icons -->
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body>

    <aside class="sidebar">
        <h2>Tikara Admin</h2>

        <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
            <i class="ph ph-squares-four"></i> Dashboard
        </a>
        <a href="{{ route('admin.events.index') }}" class="{{ request()->routeIs('admin.events.index') || request()->routeIs('admin.events.create') || request()->routeIs('admin.events.edit') ? 'active' : '' }}">
            <i class="ph ph-calendar-star"></i> Events (Official)
        </a>
        <a href="{{ route('admin.events.eo_approved') }}" class="{{ request()->routeIs('admin.events.eo_approved') ? 'active' : '' }}">
            <i class="ph ph-calendar-check"></i> Approved Events from EO
        </a>
        <a href="{{ route('admin.events.eo') }}" class="{{ request()->routeIs('admin.events.eo') ? 'active' : '' }}">
            <i class="ph ph-calendar-plus"></i> Approval Event EO
        </a>
        <a href="{{ route('admin.categories.index') }}" class="{{ request()->routeIs('admin.categories.*') ? 'active' : '' }}">
            <i class="ph ph-list-dashes"></i> Categories
        </a>
        <a href="{{ route('admin.orders.index') }}" class="{{ request()->routeIs('admin.orders.*') ? 'active' : '' }}">
            <i class="ph ph-shopping-cart"></i> Orders
        </a>
        <a href="{{ route('admin.users.index') }}" class="{{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
            <i class="ph ph-users"></i> Manage Users
        </a>
        
        <div style="font-size: 0.75rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; margin: 1.5rem 1rem 0.5rem 1rem; letter-spacing: 0.05em;">History / SoftDeletes</div>
        <a href="{{ route('admin.history.users') }}" class="{{ request()->routeIs('admin.history.users') ? 'active' : '' }}">
            <i class="ph ph-clock-counter-clockwise"></i> History Akun
        </a>
        <a href="{{ route('admin.history.eo') }}" class="{{ request()->routeIs('admin.history.eo') ? 'active' : '' }}">
            <i class="ph ph-clock-counter-clockwise"></i> History Akun EO
        </a>
        <a href="{{ route('admin.history.events_official') }}" class="{{ request()->routeIs('admin.history.events_official') ? 'active' : '' }}">
            <i class="ph ph-clock-counter-clockwise"></i> History Event Official
        </a>
        <a href="{{ route('admin.history.events_eo') }}" class="{{ request()->routeIs('admin.history.events_eo') ? 'active' : '' }}">
            <i class="ph ph-clock-counter-clockwise"></i> History Event EO
        </a>
        <a href="{{ route('admin.history.orders') }}" class="{{ request()->routeIs('admin.history.orders') ? 'active' : '' }}">
            <i class="ph ph-clock-counter-clockwise"></i> History Orders
        </a>
        
        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            @auth
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; padding: 0 1rem;">
                    Logged in as <strong>{{ auth()->user()->username }}</strong>
                </div>
                <form action="{{ route('admin.logout') }}" method="POST" style="margin: 0;">
                    @csrf
                    <button type="submit" style="width: 100%; text-align: left; background: none; border: none; padding: 0.75rem 1rem; color: #DC2626; font-weight: 500; font-size: 1rem; font-family: inherit; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; border-radius: 0.5rem; transition: background 0.3s ease;">
                        <i class="ph ph-sign-out"></i> Logout
                    </button>
                </form>
            @endauth
        </div>
    </aside>

    <main class="main-content">
        <div class="header">
            <h1>@yield('header')</h1>
        </div>

        @yield('content')
    </main>

</body>
</html>
