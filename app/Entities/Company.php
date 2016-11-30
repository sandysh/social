<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 6:22 PM
 */
namespace App\Entities;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies';

    protected $fillable = ['name', 'description'];

    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('is_owner', 'is_active');
    }

    public function newPivot(Model $parent, array $attributes, $table, $exists)
    {
        if ($parent instanceof User) {
            return new Pivot\CompanyUserPivot($parent, $attributes, $table, $exists);
        }

        return parent::newPivot($parent, $attributes, $table, $exists);
    }

    public function owner()
    {
        return $this->belongsToMany(User::class)->where('owner', true)->first();
    }

	public function projects()
	{
		return $this->hasMany(Project::class);
    }
}
