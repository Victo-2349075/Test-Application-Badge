<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Objet représentant une requête d'inscription
 */
class SignupRequest extends FormRequest
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
            'username' => strip_tags(trim($this->username ?? '')),
            'email' => strip_tags(strtolower(trim($this->email ?? ''))),
            'first_name' => strip_tags(trim($this->first_name ?? '')),
            'last_name' => strip_tags(trim($this->last_name ?? '')),
        ]);
    }

    /**
     * Définit les règles de validation pour la requête
     *
     * @return array
     */
    public function rules()
    {
        return [
            // Username : alphanumérique + underscore/tiret uniquement
            'username' => [
                'required',
                'string',
                'unique:user,username',
                'min:2',
                'max:50',
                'regex:/^[a-zA-Z0-9_-]+$/', // Empêche les scripts malveillants
            ],
            
            // Email : validation stricte
            'email' => [
                'required',
                'string',
                'email',
                'unique:user,email',
                'min:5',
                'max:125',
                'regex:/^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9_\.\-]+\.[a-zA-Z]{2,}$/',
            ],
            
            // Mot de passe : garde tes règles actuelles (6-60 caractères)
            'password' => [
                'required',
                'string',
                'min:6',
                'max:60',
            ],
            
            // Prénom/Nom : seulement lettres, espaces, tirets, apostrophes (avec accents)
            'first_name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            ],
            
            'last_name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-ZÀ-ÿ\s\'-]+$/',
            ],
            
            // Code enseignant : optionnel
            'teacher_code' => [
                'nullable',
                'string',
                Rule::exists('teacher_code', 'code')->where(function ($query) {
                    $query->whereNull('user_id');
                }),
            ],
        ];
    }

    /**
     * Messages d'erreur personnalisés
     */
    public function messages()
    {
        return [
            'username.regex' => 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores.',
            'username.unique' => 'Ce nom d\'utilisateur est déjà utilisé.',
            'email.email' => 'Le format de l\'adresse courriel est invalide.',
            'email.unique' => 'Cette adresse courriel est déjà utilisée.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
            'first_name.regex' => 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes.',
            'last_name.regex' => 'Le nom de famille ne peut contenir que des lettres, espaces, tirets et apostrophes.',
            'teacher_code.exists' => 'Ce code enseignant est invalide ou déjà utilisé.',
            'teacher_code.string' => 'Le code enseignant doit être une chaîne de caractères valide.',
        ];
    }
}
