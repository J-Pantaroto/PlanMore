<?php

namespace App\Http\Controllers;
use Illuminate\Support\Str;

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
            'updateNotifications' => false,
            'transactionAlerts' => false,
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
            'updateNotifications' => 'boolean',
            'transactionAlerts' => 'boolean',
            'telegramEnabled' => 'boolean',
            'telegramChatId' => 'nullable|string',
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

    public function generateTelegramLink(Request $request)
    {
        $user = $request->user();

        $token = Str::random(40);
        $user->telegram_link_token = $token;
        $user->save();

        $botUsername = config('services.telegram.bot_username') ?: 'planmore_notifier_bot';

        $deepLink = "https://t.me/{$botUsername}?start={$token}";

        return response()->json([
            'link'  => $deepLink,
            'token' => $token,
        ]);
    }
}
