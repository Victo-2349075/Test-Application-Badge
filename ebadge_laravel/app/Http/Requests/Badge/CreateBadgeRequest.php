<?php

namespace App\Http\Requests\Badge;

use Illuminate\Foundation\Http\FormRequest;

class CreateBadgeRequest extends FormRequest
{
    /**
     * Autorise la requête pour les utilisateurs déjà filtrés par middleware de route.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Définit les règles de validation pour la requête
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => 'required|string|max:45',
            'description' => 'required|string|max:255',
            'imagePath' => 'nullable|string|max:2048',
            'image' => 'nullable|image|mimes:png,jpg,jpeg',
            'category_id' => 'nullable',
            'category_name' => 'nullable|string'
        ];
    }
}
