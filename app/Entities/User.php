<?php
/**
 * Author: Laravel
 * Date:   2016-09-17 00:37:43
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 03:10:28
 */
namespace App\Entities;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name', 'email', 'password',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function companies()
    {
        return $this->belongsToMany(Company::class)->withPivot('owner');
    }

    public function setPasswordAttribute($password)
    {
        return $this->attributes['password'] = bcrypt($password);
    }
}
