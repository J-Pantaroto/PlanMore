<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserPreferenceController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $prefs = $user->preferences ? json_decode($user->preferences, true) : [];

        $defaults = [
            'theme' => 'light',
            'language' => 'pt',
            'emailNotifications' => false,
            'updateNotifications' => false,
            'transactionAlerts' => false,
        ];

        return response()->json(array_merge($defaults, $prefs));
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'theme' => 'in:light,dark',
            'language' => 'in:pt,en',
            'emailNotifications' => 'boolean',
            'updateNotifications' => 'boolean',
            'transactionAlerts' => 'boolean',
        ]);

        $prefs = $user->preferences ? json_decode($user->preferences, true) : [];
        $updated = array_merge($prefs, $data);

        $user->preferences = json_encode($updated);
        $user->save();
        app()->setLocale($data['language'] ?? 'pt');
        return response()->json([
            'message' => 'Preferências atualizadas com sucesso',
            'preferences' => $updated,
        ]);
    }
}
