<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($userId),
            ],
            'status' => 'sometimes|in:active,inactive,suspended',
            'meta' => 'sometimes|array',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'last_name.string' => 'Le nom doit être une chaîne de caractères.',
            'email.email' => 'L\'adresse email doit être valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'status.in' => 'Le statut doit être active, inactive ou suspended.',
        ];
    }
}
