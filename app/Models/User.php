<?php

namespace App\Models;
use App\Models\Profile;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;

class User extends Authenticatable
{
    use HasApiTokens;
    
    protected $fillable = [
        'name', 'email', 'password'
    ];

    protected $hidden = [ 'password', 'remember_token', ]; 
    protected $casts = [ 'email_verified_at' => 'datetime', 'password' => 'hashed', ];
    public function profile(){
        return $this->hasOne(Profile::class);
    }
}
