<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-17 00:29:11
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 03:26:20
 */
namespace App\Http\Controllers\Api\V1;

use App\Entities\User;
use App\Http\Controllers\Api\V1\ApiController;
use App\Http\Requests\Api\UserLogin;
use App\Http\Requests\Api\UserRegister;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\JWTAuth;

class AuthController extends ApiController
{
    protected $user;
    protected $auth;

    public function __construct(JWTAuth $auth, User $user)
    {
        $this->user = $user;
        $this->auth = $auth;
    }

    public function register(UserRegister $request)
    {
        return $this->user->create($request->all());
    }

    public function login(UserLogin $request)
    {
        $credentials = $request->only('email', 'password');
        
        try {
            if (!$token = $this->auth->attempt($credentials)) {
                return response()->json(['error' => 'invalid_credentials'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'could_not_create_token'], 500);
        }

        return response()->json([
            'message' => 'You have been successfully logged in.'
        ])->header('Authorization', "Bearer {$token}");
    }
}
