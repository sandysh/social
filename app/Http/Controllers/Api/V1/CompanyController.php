<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-18 02:56:09
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 03:10:54
 */
namespace App\Http\Controllers\Api\V1;

use App\Entities\Company;
use App\Http\Requests\Api\CompanyRequest;
use App\Transformers\CompanyTransformer;
use League\Fractal\Resource\Collection;
use Tymon\JWTAuth\JWTAuth;

class CompanyController extends ApiController
{
    protected $auth;
    protected $user;
    protected $company;

    protected $casts = [
        'pivot.owner' => 'boolean'
    ];

    public function __construct(JWTAuth $auth, Company $company)
    {
        $this->auth    = $auth;
        $this->user    = $this->getUser();
        $this->company = $company;
    }

    public function index()
    {
        return response()->collection($this->user->companies, new CompanyTransformer, 'companies');
    }

    public function store(CompanyRequest $request)
    {
        $company = $this->user->companies()->create(
            $request->only('name', 'description'), ['owner' => true]
        );

        return response()->item($company, new CompanyTransformer, 'companies', 201);
    }

    public function show($id)
    {
        $company = $this->company->findOrFail($id);

        return response()->item($company, new CompanyTransformer, 'companies');
    }

    public function getUser()
    {
        return $this->auth->parseToken()->touser();
    }
}
