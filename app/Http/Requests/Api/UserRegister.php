<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-17 00:35:16
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 03:12:49
 */
namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UserRegister extends FormRequest
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
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed'
        ];
    }
}
