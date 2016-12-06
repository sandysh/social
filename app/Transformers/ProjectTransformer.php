<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 6:24 PM
 */
namespace App\Transformers;

use App\Entities\Project;
use League\Fractal;

class ProjectTransformer extends Fractal\TransformerAbstract
{
    public function transform(Project $project)
    {
        return [
            'id'          => (int) $project->id,
            'name'        => $project->name,
            'description' => $project->description,
            'status'      => $project->status,
        ];
    }
}
