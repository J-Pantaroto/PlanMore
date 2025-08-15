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

Route::middleware('guest')->group(function () {
    Route::get('/auth/{provider}/redirect', [OAuthController::class, 'redirect'])
        ->whereIn('provider', ['google', 'github'])
        ->name('oauth.redirect');

    Route::get('/auth/{provider}/callback', [OAuthController::class, 'callback'])
        ->whereIn('provider', ['google', 'github'])
        ->name('oauth.callback');
});

require __DIR__ . '/auth.php';


Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
