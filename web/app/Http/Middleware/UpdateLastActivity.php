<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UpdateLastActivity
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $now = now()->timestamp * 1000; // Current timestamp in milliseconds
            //cookie()->queue(cookie('lastActivity', $now, 20)); // Set cookie for 20 minutes
             cookie()->queue(cookie('lastActivity', $now, 1)); 
        }
        return $next($request);
    }
}

