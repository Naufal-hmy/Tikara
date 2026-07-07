<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use App\Models\Event;
use App\Models\Order;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

class HistoryController extends Controller
{
    public function users(Request $request)
    {
        $query = Activity::with('causer')->where('subject_type', Profile::class)
                    ->join('profiles', DB::raw('CAST(activity_log.subject_id AS UUID)'), '=', 'profiles.id')
                    ->where('profiles.role', '!=', 'eo')
                    ->select('activity_log.*');
        
        if ($request->has('search') && $request->search != '') {
            $query->where(function($q) use ($request) {
                $q->where('activity_log.description', 'like', '%' . $request->search . '%')
                  ->orWhere('activity_log.properties', 'like', '%' . $request->search . '%');
            });
        }
        
        $activities = $query->latest('activity_log.created_at')->paginate(15)->appends($request->query());
        return view('admin.history.users', compact('activities'));
    }

    public function eo(Request $request)
    {
        $query = Activity::with('causer')->where('subject_type', Profile::class)
                    ->join('profiles', DB::raw('CAST(activity_log.subject_id AS UUID)'), '=', 'profiles.id')
                    ->where('profiles.role', 'eo')
                    ->select('activity_log.*');

        if ($request->has('search') && $request->search != '') {
            $query->where(function($q) use ($request) {
                $q->where('activity_log.description', 'like', '%' . $request->search . '%')
                  ->orWhere('activity_log.properties', 'like', '%' . $request->search . '%');
            });
        }

        $activities = $query->latest('activity_log.created_at')->paginate(15)->appends($request->query());
        return view('admin.history.eo', compact('activities'));
    }

    public function eventsOfficial(Request $request)
    {
        $query = Activity::with('causer')->where('subject_type', Event::class)
                    ->join('events', DB::raw('CAST(activity_log.subject_id AS BIGINT)'), '=', 'events.id')
                    ->whereNull('events.eo_id')
                    ->select('activity_log.*');
        
        if ($request->has('search') && $request->search != '') {
            $query->where(function($q) use ($request) {
                $q->where('activity_log.description', 'like', '%' . $request->search . '%')
                  ->orWhere('activity_log.properties', 'like', '%' . $request->search . '%');
            });
        }

        $activities = $query->latest('activity_log.created_at')->paginate(15)->appends($request->query());
        return view('admin.history.events_official', compact('activities'));
    }

    public function eventsEo(Request $request)
    {
        $query = Activity::with('causer')->where('subject_type', Event::class)
                    ->join('events', DB::raw('CAST(activity_log.subject_id AS BIGINT)'), '=', 'events.id')
                    ->whereNotNull('events.eo_id')
                    ->select('activity_log.*');
        
        if ($request->has('search') && $request->search != '') {
            $query->where(function($q) use ($request) {
                $q->where('activity_log.description', 'like', '%' . $request->search . '%')
                  ->orWhere('activity_log.properties', 'like', '%' . $request->search . '%');
            });
        }

        $activities = $query->latest('activity_log.created_at')->paginate(15)->appends($request->query());
        return view('admin.history.events_eo', compact('activities'));
    }

    public function orders(Request $request)
    {
        $query = Activity::with('causer')->where('subject_type', Order::class);

        if ($request->has('search') && $request->search != '') {
            $query->where(function($q) use ($request) {
                $q->where('activity_log.description', 'like', '%' . $request->search . '%')
                  ->orWhere('activity_log.properties', 'like', '%' . $request->search . '%');
            });
        }

        $activities = $query->latest('activity_log.created_at')->paginate(15)->appends($request->query());
        return view('admin.history.orders', compact('activities'));
    }
}
