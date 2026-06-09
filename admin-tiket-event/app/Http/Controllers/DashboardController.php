<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Order;
use App\Models\Profile;

class DashboardController extends Controller
{
    public function index()
    {
        $eventsCount = Event::count();
        $ordersCount = Order::count();
        $usersCount = Profile::count();
        
        // Asumsi kolom total_price menyimpan harga pesanan
        $totalRevenue = Order::where('status', 'success')->sum('total_price');

        $recentEvents = Event::orderBy('created_at', 'desc')->take(5)->get();

        return view('admin.dashboard', compact(
            'eventsCount', 
            'ordersCount', 
            'usersCount', 
            'totalRevenue', 
            'recentEvents'
        ));
    }
}
