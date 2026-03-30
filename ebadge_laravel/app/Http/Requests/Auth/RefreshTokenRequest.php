<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Requête pour le rafraîchissement de token
 */
class RefreshTokenRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à faire cette requête
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'refresh_token' => 'required|string|min:20',
        ];
    }

    /**
     * Messages d'erreur personnalisés
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'refresh_token.required' => 'Le token de rafraîchissement est requis',
            'refresh_token.string' => 'Le token de rafraîchissement doit être une chaîne de caractères',
            'refresh_token.min' => 'Le token de rafraîchissement est invalide',
        ];
    }
}
