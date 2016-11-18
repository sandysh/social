<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-17 23:16:11
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 02:54:01
 */
namespace App\Entities;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies';

    protected $fillable = ['name', 'description'];

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('owner');
    }

    public function owner()
    {
        return $this->belongsToMany(User::class)->where('owner', true);
    }
}