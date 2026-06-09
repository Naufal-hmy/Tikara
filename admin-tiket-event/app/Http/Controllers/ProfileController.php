<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;

class ProfileController extends Controller
{
    public function index()
    {
        $users = Profile::paginate(15);
        return view('admin.users.index', compact('users'));
    }
}
