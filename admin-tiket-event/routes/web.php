<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HistoryController;

use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'authenticate'])->name('admin.authenticate');
Route::post('/logout', [AuthController::class, 'logout'])->name('admin.logout');

Route::middleware('auth')->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/events/eo_approved', [EventController::class, 'approvedEoEvents'])->name('admin.events.eo_approved');
    Route::get('/admin/events/eo', [EventController::class, 'eoEvents'])->name('admin.events.eo');
    Route::post('/admin/events/{event}/approve', [EventController::class, 'approve'])->name('admin.events.approve');
    Route::post('/admin/events/{event}/reject', [EventController::class, 'reject'])->name('admin.events.reject');
    Route::resource('/admin/events', EventController::class, ['as' => 'admin']);
    Route::resource('/admin/categories', CategoryController::class, ['as' => 'admin']);
    Route::get('/admin/orders', [OrderController::class, 'index'])->name('admin.orders.index');
    Route::delete('/admin/orders/{order}', [OrderController::class, 'destroy'])->name('admin.orders.destroy');
    Route::resource('/admin/users', ProfileController::class, ['as' => 'admin', 'parameters' => ['users' => 'user']]);

    // History Routes
    Route::prefix('admin/history')->name('admin.history.')->group(function () {
        Route::get('/users', [HistoryController::class, 'users'])->name('users');
        Route::get('/eo', [HistoryController::class, 'eo'])->name('eo');
        Route::get('/events-official', [HistoryController::class, 'eventsOfficial'])->name('events_official');
        Route::get('/events-eo', [HistoryController::class, 'eventsEo'])->name('events_eo');
        Route::get('/orders', [HistoryController::class, 'orders'])->name('orders');

        Route::post('/profiles/{id}/restore', [HistoryController::class, 'restoreProfile'])->name('profiles.restore');
        Route::delete('/profiles/{id}/force', [HistoryController::class, 'forceDeleteProfile'])->name('profiles.force_delete');
        
        Route::post('/events/{id}/restore', [HistoryController::class, 'restoreEvent'])->name('events.restore');
        Route::delete('/events/{id}/force', [HistoryController::class, 'forceDeleteEvent'])->name('events.force_delete');
        
        Route::post('/orders/{id}/restore', [HistoryController::class, 'restoreOrder'])->name('orders.restore');
        Route::delete('/orders/{id}/force', [HistoryController::class, 'forceDeleteOrder'])->name('orders.force_delete');
    });
});
