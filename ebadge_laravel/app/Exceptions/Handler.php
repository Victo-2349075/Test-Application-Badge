<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $exception
     * @return void
     *
     * @throws \Exception
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     * 
     * @author Philippe-Vu Beaulieu
     */
    public function render($request, Throwable $exception)
    {
        // Normalisation des erreurs SQL pour éviter de renvoyer des détails sensibles
        // (requêtes, noms de colonnes exacts, traces SQL, etc.) au front-end.
        if ($exception instanceof QueryException) {
            return response()->json([
                'message' => 'Erreur SQL: une opération en base de données a échoué.',
                'error_code' => 'DB_QUERY_ERROR',
            ], 500);
        }

        // On conserve une réponse JSON claire pour les erreurs d'authentification API.
        if ($exception instanceof AuthenticationException) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return parent::render($request, $exception);
    }
}
