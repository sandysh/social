<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-18 01:46:55
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 02:04:34
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
