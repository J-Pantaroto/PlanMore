<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\OAuthController;


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/dashboard', function () {
        return view('app');
    })->name('dashboard');
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

    $user = User::updateOrCreate(
        ['email' => $githubUser->getEmail()],
        ['name' => $githubUser->getName()]
    );

    Auth::login($user);

    return redirect('/dashboard');
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
