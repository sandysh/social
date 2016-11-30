<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 6:22 PM
 */
namespace App\Entities;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
    	'name', 'description', 'status'
    ];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}
}
