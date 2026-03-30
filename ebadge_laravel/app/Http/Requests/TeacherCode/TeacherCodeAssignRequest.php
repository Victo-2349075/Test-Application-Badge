<?php

namespace App\Http\Requests\TeacherCode;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Objet représentant une requête d'assignation d'un code enseignant
 */
class TeacherCodeAssignRequest extends FormRequest
{
    /**
     * Définit les règles de validation pour la requête
     *
     * @return array
     */
    public function rules()
    {
        return [
            'user_id' => 'nullable|exists:user,id',
            'teacher_code_id' => 'nullable|exists:teacher_code,id',
        ];
    }

    
    /**
     * Définit les messages de validation personnalisés.
     *
     * @return array
     * @author Philippe-Vu Beaulieu
     */
    public function messages()
    {
        return [
            'user_id.exists' => "L'utilisateur sélectionné est introuvable.",
            'teacher_code_id.exists' => 'Le code enseignant sélectionné est invalide.',
        ];
    }
}
