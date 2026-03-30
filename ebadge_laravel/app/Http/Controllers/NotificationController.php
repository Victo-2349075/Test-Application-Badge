<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

/**
 * Le controlleur pour les notifications.
 * 
 * @author Zacharie Nolet - 2026-03-11
 */
class NotificationController extends Controller
{
    /**
     * Retourne toutes les notifications avec user et badge
     */
    public function index()
    {
        $notifications = Notification::with(['user', 'badge'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notif) {
                return [
                    'id'         => $notif->id,
                    'type'       => $notif->type,
                    'rank'       => $notif->rank,
                    'created_at' => $notif->created_at,
                    'user' => $notif->user ? [
                        'id'              => $notif->user->id,
                        'first_name'      => $notif->user->first_name,
                        'last_name'       => $notif->user->last_name,
                        'avatarImagePath' => $notif->user->avatarImagePath,
                    ] : null,
                    'badge' => $notif->badge ? [
                        'id'        => $notif->badge->id,
                        'title'     => $notif->badge->title,
                        'imagePath' => $notif->badge->imagePath,
                        'categoryColor' => $notif->badge->categories->first()->color ?? null
                    ] : null,
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Supprime une notification
     */
    public function destroy($id)
    {
        $notif = Notification::find($id);

        if (!$notif) {
            return response()->json(['message' => 'Notification introuvable'], 404);
        }

        $notif->delete();

        return response()->json(['message' => 'Supprimée']);
    }
}