<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Service de logging sécurisé pour l'authentification
 * Logue les événements importants de sécurité
 */
class SecurityLogger
{
    /**
     * Niveaux de sévérité
     */
    const SEVERITY_LOW = 'low';
    const SEVERITY_MEDIUM = 'medium';
    const SEVERITY_HIGH = 'high';
    const SEVERITY_CRITICAL = 'critical';

    /**
     * Types d'événements
     */
    const EVENT_LOGIN_SUCCESS = 'login_success';
    const EVENT_LOGIN_FAILED = 'login_failed';
    const EVENT_LOGOUT = 'logout';
    const EVENT_SIGNUP = 'signup';
    const EVENT_PASSWORD_CHANGED = 'password_changed';
    const EVENT_PASSWORD_RESET_REQUESTED = 'password_reset_requested';
    const EVENT_PASSWORD_RESET_COMPLETED = 'password_reset_completed';
    const EVENT_TOKEN_REFRESHED = 'token_refreshed';
    const EVENT_TOKEN_REVOKED = 'token_revoked';
    const EVENT_SUSPICIOUS_ACTIVITY = 'suspicious_activity';
    const EVENT_UNAUTHORIZED_ACCESS = 'unauthorized_access';
    const EVENT_RATE_LIMIT_HIT = 'rate_limit_hit';
    const EVENT_ACCOUNT_LOCKED = 'account_locked';
    const EVENT_ACCOUNT_UNLOCKED = 'account_unlocked';

    /**
     * Log une tentative de connexion réussie
     */
    public static function logLoginSuccess(Request $request, $user): void
    {
        self::log(self::EVENT_LOGIN_SUCCESS, self::SEVERITY_LOW, [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log une tentative de connexion échouée
     */
    public static function logLoginFailed(Request $request, string $email, ?string $reason = null): void
    {
        // Détecter si c'est une attaque potentielle
        $severity = self::detectBruteForceAttempt($email, $request->ip()) 
            ? self::SEVERITY_HIGH 
            : self::SEVERITY_MEDIUM;

        self::log(self::EVENT_LOGIN_FAILED, $severity, [
            'email' => $email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'reason' => $reason,
            'failed_attempts_last_hour' => self::getFailedAttemptsCount($email, $request->ip()),
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log une déconnexion
     */
    public static function logLogout(Request $request, $user): void
    {
        self::log(self::EVENT_LOGOUT, self::SEVERITY_LOW, [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'token_id' => $request->user()->token()?->id,
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log une inscription
     */
    public static function logSignup(Request $request, $user): void
    {
        self::log(self::EVENT_SIGNUP, self::SEVERITY_LOW, [
            'user_id' => $user->id,
            'email' => $user->email,
            'username' => $user->username,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log un changement de mot de passe
     */
    public static function logPasswordChanged(Request $request, $user): void
    {
        self::log(self::EVENT_PASSWORD_CHANGED, self::SEVERITY_MEDIUM, [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log un refresh de token
     */
    public static function logTokenRefreshed(Request $request, $user, string $oldTokenId, string $newTokenId): void
    {
        self::log(self::EVENT_TOKEN_REFRESHED, self::SEVERITY_LOW, [
            'user_id' => $user->id,
            'email' => $user->email,
            'old_token_id' => $oldTokenId,
            'new_token_id' => $newTokenId,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log une révocation de token
     */
    public static function logTokenRevoked(Request $request, $user, string $tokenId): void
    {
        self::log(self::EVENT_TOKEN_REVOKED, self::SEVERITY_LOW, [
            'user_id' => $user->id,
            'email' => $user->email,
            'token_id' => $tokenId,
            'ip' => $request->ip(),
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log une activité suspecte
     */
    public static function logSuspiciousActivity(Request $request, string $description, array $context = []): void
    {
        self::log(self::EVENT_SUSPICIOUS_ACTIVITY, self::SEVERITY_HIGH, array_merge([
            'description' => $description,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->url(),
            'method' => $request->method(),
            'timestamp' => now()->toIso8601String()
        ], $context));
    }

    /**
     * Log un accès non autorisé
     */
    public static function logUnauthorizedAccess(Request $request, ?string $reason = null): void
    {
        self::log(self::EVENT_UNAUTHORIZED_ACCESS, self::SEVERITY_HIGH, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->url(),
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'reason' => $reason,
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log un verrouillage de compte
     */
    public static function logAccountLocked(string $email, string $reason): void
    {
        self::log(self::EVENT_ACCOUNT_LOCKED, self::SEVERITY_HIGH, [
            'email' => $email,
            'reason' => $reason,
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log un déverrouillage de compte
     */
    public static function logAccountUnlocked(string $email, string $reason): void
    {
        self::log(self::EVENT_ACCOUNT_UNLOCKED, self::SEVERITY_MEDIUM, [
            'email' => $email,
            'reason' => $reason,
            'timestamp' => now()->toIso8601String()
        ]);
    }

    /**
     * Log générique
     */
    protected static function log(string $event, string $severity, array $data): void
    {
        $logData = [
            'event' => $event,
            'severity' => $severity,
            'data' => $data
        ];

        // Choisir le canal de log selon la sévérité
        switch ($severity) {
            case self::SEVERITY_CRITICAL:
                Log::critical('[SECURITY] ' . $event, $logData);
                // Optionnel : envoyer une alerte aux admins
                break;
            case self::SEVERITY_HIGH:
                Log::error('[SECURITY] ' . $event, $logData);
                break;
            case self::SEVERITY_MEDIUM:
                Log::warning('[SECURITY] ' . $event, $logData);
                break;
            default:
                Log::info('[SECURITY] ' . $event, $logData);
        }

        // Optionnel : stocker dans la base de données pour analyse
        // self::storeInDatabase($event, $severity, $data);
    }

    /**
     * Détecte une tentative de brute force
     */
    protected static function detectBruteForceAttempt(string $email, string $ip): bool
    {
        $attempts = self::getFailedAttemptsCount($email, $ip);
        return $attempts >= 10; // Seuil de détection
    }

    /**
     * Compte les tentatives échouées récentes
     */
    protected static function getFailedAttemptsCount(string $email, string $ip): int
    {
        // Cette méthode peut être implémentée avec Redis ou la base de données
        // Pour l'instant, on retourne une estimation basée sur les logs
        return 0; // À implémenter selon ton architecture
    }

    /**
     * Stocke l'événement en base de données (optionnel)
     */
    protected static function storeInDatabase(string $event, string $severity, array $data): void
    {
        // Nécessite une table security_logs
        /*
        DB::table('security_logs')->insert([
            'event' => $event,
            'severity' => $severity,
            'user_id' => $data['user_id'] ?? null,
            'email' => $data['email'] ?? null,
            'ip_address' => $data['ip'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
            'details' => json_encode($data),
            'created_at' => now()
        ]);
        */
    }
}
