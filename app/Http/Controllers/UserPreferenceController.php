<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserPreferenceController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $prefs = is_array($user->preferences)
            ? $user->preferences
            : (json_decode($user->preferences, true) ?? []);

        $defaults = [
            'theme' => 'light',
            'language' => 'pt',
            'emailNotifications' => false,
            'telegramEnabled' => false,
            'telegramChatId' => '',
        ];

        return response()->json(array_merge($defaults, $prefs));
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'theme' => 'nullable|in:light,dark',
            'language' => 'nullable|in:pt,en',
            'emailNotifications' => 'boolean',
            'telegramEnabled' => 'boolean',
            'telegramChatId' => 'array',
        ]);

        $prefs = is_array($user->preferences)
            ? $user->preferences
            : (json_decode($user->preferences, true) ?? []);

        $updated = array_merge($prefs, $data);

        $user->preferences = $updated;
        $user->save();

        app()->setLocale($updated['language'] ?? 'pt');

        return response()->json([
            'message' => 'Preferências atualizadas com sucesso',
            'preferences' => $updated,
        ]);
    }
}
