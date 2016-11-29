<?php
/**
 * Author: Roshan Kharel
 * Date:   2016-09-17 23:16:11
 * Last Modified by:   Roshan Kharel
 * Last Modified time: 2016-09-18 02:54:01
 */
namespace App\Entities\Pivot;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CompanyUserPivot extends Pivot
{
    protected $casts = [
        'owner' => 'boolean'
    ];
}
