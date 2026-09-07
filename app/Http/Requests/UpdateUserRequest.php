<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|unique:users,email,' . $this->user->id,
            'password' => 'required|string'
        ];
    }

    public function message(): array{
        return[
        'name.required' => 'the name field is required',
        'name.string' => 'the name field must be string',
        'name.max' => 'the name char can not be more than 255',
        'email.string' => 'the email type is must be string',
        'email.required' => 'the email field is required',
        'email.unique' => 'the email field is already in use',
        'password.required' => 'password is required',
        'password.string' => 'password must be string',
        ];
    }
}
