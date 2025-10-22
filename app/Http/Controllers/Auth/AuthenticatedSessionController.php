<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();

        $preferences = $user->preferences ? json_decode($user->preferences, true) : [];
        $theme = $preferences['theme'] ?? 'light';
        $locale = $preferences['locale'] ?? 'pt';

        session([
            'theme' => $theme,
            'locale' => $locale,
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            $response = response()->json([
                'message' => 'Login realizado com sucesso',
                'theme'   => $theme,
                'locale'  => $locale,
                'csrf'    => csrf_token(),
                'user'    => $user->only(['id', 'name', 'email']),
            ]);

            $response->withCookie(
                cookie()->forever(config('session.cookie'), session()->getId())
            );

            return $response;
        }

        return redirect()->intended(route('dashboard'));
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Logout realizado com sucesso']);
        }

        return redirect('/');
    }


}
