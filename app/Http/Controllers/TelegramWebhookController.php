<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request, string $secret)
    {
        if ($secret !== config('services.telegram.webhook_secret')) {
            abort(403, 'Invalid webhook secret');
        }

        $update = $request->all();

        $message = $update['message'] ?? null;
        if (!$message) {
            return response()->json(['ok' => true]);
        }

        $chatId = $message['chat']['id'] ?? null;
        $text   = trim($message['text'] ?? '');

        if (Str::startsWith($text, '/start')) {
            $parts = explode(' ', $text, 2);
            $linkToken = $parts[1] ?? null;

            if ($linkToken) {
                $user = User::where('telegram_link_token', $linkToken)->first();

                if ($user) {
                    $prefs = $user->preferences ?? [];
                    if (is_string($prefs)) {
                        $prefs = json_decode($prefs, true) ?: [];
                    }

                    $prefs['telegramEnabled'] = true;
                    $prefs['telegramChatId']  = (string)$chatId;

                    $user->preferences = $prefs;
                    $user->telegram_chat_id = (string)$chatId;
                    $user->telegram_link_token = null;
                    $user->save();

                    $this->sendTelegramMessage(
                        "Sua conta PlanMore foi conectada com sucesso!",
                        $chatId
                    );
                } else {
                    $this->sendTelegramMessage(
                        "Não foi possível vincular sua conta. Token inválido ou expirado.",
                        $chatId
                    );
                }
            } else {
                $this->sendTelegramMessage(
                    "Olá! Acesse o PlanMore e clique em *Conectar com Telegram* nas preferências para vincular sua conta.",
                    $chatId
                );
            }
        }

        return response()->json(['ok' => true]);
    }

    protected function sendTelegramMessage(string $text, string $chatId): void
    {
        $token = config('services.telegram.bot_token');
        if (!$token) {
            return;
        }

        @file_get_contents("https://api.telegram.org/bot{$token}/sendMessage?" . http_build_query([
            'chat_id' => $chatId,
            'text'    => $text,
            'parse_mode' => 'Markdown',
        ]));
    }
}