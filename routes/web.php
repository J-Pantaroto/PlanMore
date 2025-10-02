<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\OAuthController;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/logout', function (\Illuminate\Http\Request $request) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session->regenerateToken();
        return response()->json(['message' => 'Logout realizado']);
    });
    Route::get('/dashboard', function () {
        return view('app');
    })->name('dashboard');


    Route::get('/transactions', function () {
        return view('app');
    })->name('transactions');
});



require __DIR__ . '/auth.php';

// Google
Route::get('/auth/google', function () {
    return Socialite::driver('google')->redirect();
});
Route::get('/auth/google/callback', function () {
    $googleUser = Socialite::driver('google')->user();

    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        ['name' => $googleUser->getName()]
    );

    Auth::login($user);

    return redirect('/dashboard');
});

// GitHub
Route::get('/auth/github', function () {
    return Socialite::driver('github')->redirect();
});
Route::get('/auth/github/callback', function () {
    $githubUser = Socialite::driver('github')->user();

    logger()->info('GitHub User', [
        'id' => $githubUser->getId(),
        'nickname' => $githubUser->getNickname(),
        'name' => $githubUser->getName(),
        'email' => $githubUser->getEmail(),
    ]);

    $user = User::updateOrCreate(
        ['email' => $githubUser->getEmail()],
        [
            'name' => $githubUser->getName() ?? $githubUser->getNickname(),
        ]
    );

    Auth::login($user);

    return redirect('/dashboard');
});


Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
