<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Goal;
use App\Models\User;
use App\Services\UserNotifier;

class CheckGoalNotifications extends Command
{
    protected $signature = 'planmore:check-goal-notifications';
    protected $description = 'Notificar quando uma meta estiver a menos de 20% de ser atingida';

    public function __construct(
        protected UserNotifier $notifier
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $goals = Goal::where('status', 'em progresso')->get();

        foreach ($goals as $goal) {
            /** @var User|null $user */
            $user = $goal->user ?? null;
            if (!$user) {
                continue;
            }

            $prefs = is_array($user->preferences) ? $user->preferences : [];
            if (
                empty($prefs['emailNotifications']) &&
                empty($prefs['telegramEnabled'])
            ) {
                continue;
            }

            $this->notifier->goalNearlyReached($user, $goal);
        }

        $this->info('Notificações de metas verificadas.');
        return Command::SUCCESS;
    }
}
