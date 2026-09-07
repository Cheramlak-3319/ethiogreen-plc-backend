<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;




Route::resource('users', UserController::class)->middleware('auth:sanctum');
Route::resource('products', ProductController::class)->middleware('auth:sanctum');
Route::post('/login', [UserController::class, 'login']);

Route::post('/profiles/{user}', [ProfileController::class, 'store'])->middleware('auth:sanctum');

Route::get('/token/{user}', function(Request $request, User $user){
        $authorization = $request->header('Authorization');
        $profile = $user->profile;
        if(!$authorization){
            return response()->json([
                'message' => 'Authorization token is required',
                'user' => $user,
            ], 401);
        }

          return response()->json([
            'user' => $user,
            // 'profile' => $profile,
        ]);
        
        // return $next($request);
});