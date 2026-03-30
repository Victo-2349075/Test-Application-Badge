<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; // ✅ import manquant

/**
 * Classe représentant le modèle des tables notification dans notre base.
 * 
 * @author Zacharie Nolet
 */
class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    public $timestamps = true; // Génère created_at et updated_at

    protected $fillable = [
        'type',
        'user_id',
        'badge_id',
        'rank'
    ];

    // Relation avec l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Relation avec le badge
    public function badge()
    {
        return $this->belongsTo(Badge::class, 'badge_id', 'id');
    }

    // Helper pour le message affiché
    public function getMessage()
    {
        $name = $this->user
            ? "{$this->user->first_name} {$this->user->last_name}"
            : "Inconnu";

        return match($this->type) {
            'badge_created' => "{$name} a créé un badge",
            'badge_earned'  => "{$name} a gagné un badge",
            'ranking'       => "{$name} est maintenant {$this->rank}" 
                               . ($this->rank == 1 ? "ère" : "ème") 
                               . " position", 
            'system_reset'  => "L'administrateur a réinitialisé le système",
            default         => "Notification",
        };
    }
}