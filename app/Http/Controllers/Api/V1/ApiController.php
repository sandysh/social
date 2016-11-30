<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 4:44 PM
 */
namespace App\Http\Controllers\Api\V1;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Tymon\JWTAuth\JWTAuth;

class ApiController extends BaseController
{
	use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

	protected $auth;
	protected $user;
	protected $activeCompany;

	public function __construct(JWTAuth $auth)
	{
		$this->auth          = $auth;
		$this->user          = $this->getUser();
		$this->activeCompany = $this->getActiveCompany();
	}

	public function getUser()
	{
//		dd($this->auth);
		return $this->auth->parseToken()->touser();
	}

	public function getActiveCompany()
	{
		return $this->user->companies()->wherePivot('is_active', true)->first();
	}
}
