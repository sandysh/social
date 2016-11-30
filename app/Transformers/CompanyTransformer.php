<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 6:24 PM
 */
namespace App\Transformers;

use App\Entities\Company;
use League\Fractal;

class CompanyTransformer extends Fractal\TransformerAbstract
{
    public function transform(Company $company)
    {
        return [
            'id'    => (int) $company->id,
            'name' => $company->name,
            'description' => $company->description,
        ];
    }
}
