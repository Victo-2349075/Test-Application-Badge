<?php 
namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Models\Notification;

class RankingService
{
     /**
     * Compare les trois premières position et crée la/les notification(s) si un changement est survenue.
     * @author Zacharie Nolet
     */  
    public function checkAndNotify()
    {
        // Top 3 ACTUEL
        $currentTop3 = User::where('role_id', '=', Role::Student()->id)
            ->where('privacy', '=', 0)
            ->where('active', '=', 1)
            ->withCount('badges')
            ->orderBy('badges_count', 'desc')
            ->take(3)
            ->get();

        // Top 3 PRÉCÉDENT
        $previousTop3 = Notification::where('type', 'ranking')
            ->whereIn('rank', [1, 2, 3])
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique('rank')
            ->pluck('user_id', 'rank');

        // Compare rang par rang
        foreach ($currentTop3 as $index => $student) {
            $rank = $index + 1;
            $previousUserId = $previousTop3->get($rank);

            // Notifie seulement si ce rang a changé
            if ($previousUserId !== $student->id) {
                Notification::create([
                    'type'    => 'ranking',
                    'user_id' => $student->id,
                    'rank'    => $rank,
                ]);
            }
        }
    }
}