<?php

namespace App\Models;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'f_name', 'l_name', 'phone', 'role', 'user_id'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }
}
