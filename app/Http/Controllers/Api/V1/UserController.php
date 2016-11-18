<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-17 23:11:49
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 01:02:32
 */
namespace App\Http\Controllers\Api\V1;

use Tymon\JWTAuth\JWTAuth;

class UserController extends ApiController
{
    protected $auth;

    public function __construct(JWTAuth $auth)
    {
        $this->auth = $auth;
    }

    public function index()
    {
        return $this->auth()->user();
    }

    public function user()
    {
        $user = $this->auth->parseToken()->authenticate()->load('companies');

        return response()->json(['data' => $user]);
    }
}
