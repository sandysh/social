<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 6:22 PM
 */
namespace App\Http\Controllers\Api\V1;

use App\Entities\Project;
use App\Http\Requests\Api\ProjectRequest;
use Tymon\JWTAuth\JWTAuth;

class ProjectsController extends ApiController
{
	protected $project;

	public function __construct(Project $project, JWTAuth $auth)
	{
		parent::__construct($auth);
		$this->project = $project;
	}

	public function index()
	{
		return $this->activeCompany->projects;
	}

	public function store(ProjectRequest $request)
	{
		return $this->activeCompany->projects()->create($request->only('name', 'description', 'status'));
	}
}
