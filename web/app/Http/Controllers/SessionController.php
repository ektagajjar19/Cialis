<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    public function checkSession(Request $request)
    {
        $lastActivity = $request->cookie('lastActivity');
        $now = now()->timestamp * 1000; 
        $logoutTime = 50000; 
        if ($lastActivity && ($now - $lastActivity > $logoutTime)) {
            Auth::logout();
            return response()->json(['logout' => true]);
        }
        return response()->json(['logout' => false]);
    }
}

