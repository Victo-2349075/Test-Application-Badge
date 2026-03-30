<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Objet représentant une requête de connexion
 */
class LoginRequest extends FormRequest
{
    /**
     * Détermine si l'utilisateur est autorisé à faire cette requête
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prépare les données avant validation (sanitization anti-XSS)
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'email' => strip_tags(strtolower(trim($this->email))),
        ]);
    }

    /**
     * Les règles de validation
     *
     * @return array
     */
    public function rules()
    {
        return [
            'email' => [
                'required',
                'string',
                'email',
                'max:125',
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'max:60',
            ],
            'remember_me' => 'boolean',
        ];
    }

    /**
     * Configure le rate limiting pour éviter les attaques par force brute
     */
    public function authenticate()
    {
        $this->ensureIsNotRateLimited();
    }

    /**
     * Vérifie que l'utilisateur n'a pas fait trop de tentatives
     */
    protected function ensureIsNotRateLimited()
    {
        $key = $this->throttleKey();

        if (RateLimiter::tooManyAttempts($key, 5)) { // 5 tentatives max
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'email' => "Trop de tentatives de connexion. Réessayez dans {$seconds} secondes.",
            ]);
        }

        RateLimiter::hit($key, 60); // Bloque pendant 60 secondes après 5 tentatives
    }

    /**
     * Clé unique pour le rate limiting (par IP + email)
     */
    public function throttleKey(): string
    {
        return strtolower($this->input('email')) . '|' . $this->ip();
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages()
    {
        return [
            'email.required' => 'L\'adresse courriel est requise.',
            'email.email' => 'Le format de l\'adresse courriel est invalide.',
            'password.required' => 'Le mot de passe est requis.',
        ];
    }
}
