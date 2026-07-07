<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['event', 'user']);

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('id', 'like', '%' . $searchTerm . '%')
                  ->orWhere('user_id', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('event', function($qEvent) use ($searchTerm) {
                      $qEvent->where('title', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        if ($request->has('filter_status') && $request->filter_status != '') {
            $query->where('status', $request->filter_status);
        }

        if ($request->has('filter_checkin') && $request->filter_checkin != '') {
            $query->where('is_checked_in', $request->filter_checkin == 'yes');
        }

        if ($request->has('filter_date') && $request->filter_date != '') {
            $query->whereDate('created_at', $request->filter_date);
        }

        if ($request->has('filter_quantity') && $request->filter_quantity != '') {
            $query->where('quantity', $request->filter_quantity);
        }

        if ($request->has('filter_price') && $request->filter_price != '') {
            $query->where('total_price', $request->filter_price);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15)->appends($request->query());
        return view('admin.orders.index', compact('orders'));
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return back()->with('success', 'Order deleted successfully.');
    }
}
