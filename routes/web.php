<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app'); // Carrega o React pelo Blade
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return view('app');
    })->name('dashboard');

    Route::get('/profile', function () {
        return view('app');
    })->name('profile.edit');
});

require __DIR__.'/auth.php';
