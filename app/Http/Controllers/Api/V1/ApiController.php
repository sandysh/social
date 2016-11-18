<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-17 23:07:42
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-17 23:12:27
 */
namespace App\Http\Controllers\Api\V1;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class ApiController extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
