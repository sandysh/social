<?php
/**
 * Author: Dipesh Rijal
 * Date: 2016-11-30 6:24 PM
 */
namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UserLogin extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'password' => 'required',
            'email'    => 'required|email',
        ];
    }
}
