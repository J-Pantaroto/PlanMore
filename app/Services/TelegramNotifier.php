<?php
namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class TelegramNotifier
{
    protected string $botToken;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', env('TELEGRAM_BOT_TOKEN', ''));
    }

    public function sendMessage(?string $chatId, string $message): bool
    {
        if (!$this->botToken || !$chatId) {
            return false;
        }

        try {
            $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";

            $resp = Http::post($url, [
                'chat_id'    => $chatId,
                'text'       => $message,
                'parse_mode' => 'Markdown',
            ]);

            if (!$resp->successful()) {
                Log::warning('Telegram API error', [
                    'status' => $resp->status(),
                    'body'   => $resp->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('Erro ao enviar mensagem Telegram', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
