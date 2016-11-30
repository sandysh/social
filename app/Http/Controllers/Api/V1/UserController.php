<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 4:44 PM
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
