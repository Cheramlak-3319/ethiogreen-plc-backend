<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\UserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        $validated = $request->validated();


        $user = User::create($validated,
        [
            'password' => $validated['password'],
        ]
        );

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json([
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();
        
        $user->update($validated);

        return response()->json([
            'message' =>'user updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }

    public function login(Request $request)
        {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
            
            if (!auth()->attempt($credentials)) 
            { 
                return response()->json([ 'message' => 'Invalid email or password', ], 401); 
            } 
            
            $user = auth()->user(); 
            
            $token1 = $user->createToken('api-token')->plainTextToken;
            $token2 = Str::random(60);
            $token3 = bin2hex(random_bytes(60));

            return response()->json([ 
                'message' => 'Login successful', 
                'user' => $user,
                'token 1' => $token1,
                'token 2' => $token2,
                'token 3' => $token3,
                ]);
        }
}
