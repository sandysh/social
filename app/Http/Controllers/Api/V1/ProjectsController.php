<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 6:22 PM
 */
namespace App\Http\Controllers\Api\V1;

use App\Entities\Project;
use App\Http\Requests\Api\ProjectRequest;
use App\Transformers\ProjectTransformer;
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
        $projects = $this->activeCompany->projects;

        return response()
            ->collection($projects, new ProjectTransformer, 'projects');
    }

    public function store(ProjectRequest $request)
    {
        $project = $this->activeCompany
            ->projects()
            ->create($request->only('name', 'description', 'status'));

        return response()
            ->item($project, new ProjectTransformer, 'projects');
    }
}
