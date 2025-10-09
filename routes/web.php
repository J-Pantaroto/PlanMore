<?php
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CategoryRecognitionController;

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
    $provider = 'google';
    $oauthUser = Socialite::driver($provider)->user();

    $user = User::updateOrCreate(
        ['email' => $oauthUser->getEmail()],
        [
            'name' => $oauthUser->getName(),
            'provider_name' => $provider,
            'provider_id' => $oauthUser->getId(),
            'avatar' => $oauthUser->getAvatar(),
            'password' => Hash::make(Str::random(16)),
        ]
    );


    Auth::login($user);

    return redirect('/dashboard');
});

// GitHub
Route::get('/auth/github', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/github/callback', function () {
    $provider = 'github';
    $oauthUser = Socialite::driver($provider)->user();
    $name = $oauthUser->getName() 
            ?? $oauthUser->getNickname() 
            ?? Str::before($oauthUser->getEmail(), '@');
    $user = User::updateOrCreate(
        ['email' => $oauthUser->getEmail()],
        [
            'name' => $name,
            'provider_name' => $provider,
            'provider_id' => $oauthUser->getId(),
            'avatar' => $oauthUser->getAvatar(),
            'password' => Hash::make(Str::random(16)),
        ]
    );


    Auth::login($user);

    return redirect('/dashboard');
});



Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
