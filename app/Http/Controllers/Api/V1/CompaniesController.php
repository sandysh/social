<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 4:45 PM
 */
namespace App\Http\Controllers\Api\V1;

use App\Entities\Company;
use App\Http\Requests\Api\CompanyRequest;
use App\Transformers\CompanyTransformer;
use Tymon\JWTAuth\JWTAuth;

class CompaniesController extends ApiController
{
    protected $company;

    public function __construct(Company $company, JWTAuth $auth)
    {
        parent::__construct($auth);

        $this->company = $company;
    }

    public function index()
    {
        return response()
            ->collection($this->user->companies, new CompanyTransformer, 'companies');
    }

    public function store(CompanyRequest $request)
    {
        $company = $this->user->companies()->create(
            $request->only('name', 'description'), [
                'is_owner'  => true,
                'is_active' => !$this->user->companies->contains('pivot.is_active', true),
            ]
        );

        return response()
            ->item($company, new CompanyTransformer, 'companies', 201);
    }

    public function show($id)
    {
        $company = $this->company->findOrFail($id);

        return response()
            ->item($company, new CompanyTransformer, 'companies');
    }
}
