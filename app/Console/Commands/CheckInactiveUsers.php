<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Transaction;
use App\Services\UserNotifier;
use Carbon\Carbon;

class CheckInactiveUsers extends Command
{
    protected $signature = 'planmore:check-inactive-users';
    protected $description = 'Notificar usuários que estão há 2 dias ou mais sem lançar transações';

    public function __construct(
        protected UserNotifier $notifier
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $cutoff = Carbon::now()->subDays(2)->startOfDay();

        $users = User::all();

        foreach ($users as $user) {
            $prefs = is_array($user->preferences) ? $user->preferences : [];
            if (
                empty($prefs['emailNotifications']) &&
                empty($prefs['telegramEnabled'])
            ) {
                continue;
            }

            $lastTx = Transaction::where('user_id', $user->id)
                ->orderByDesc('date')
                ->orderByDesc('created_at')
                ->first();

            if (!$lastTx) {
                continue;
            }

            $lastDate = Carbon::parse($lastTx->date ?? $lastTx->created_at);

            if ($lastDate->lt($cutoff)) {
                $this->notifier->inactiveUser($user, 2);
            }
        }

        $this->info('Usuários inativos verificados.');
        return Command::SUCCESS;
    }
}
