<?php


namespace App\Services;

use App\Models\User;
use App\Models\Goal;
use App\Models\Transaction;
use Illuminate\Support\Facades\Mail;

class UserNotifier
{
    public function __construct(
        protected TelegramNotifier $telegram
    ) {}

    protected function getPrefs(User $user): array
    {
        return is_array($user->preferences) ? $user->preferences : [];
    }

    protected function notify(User $user, string $subject, string $message): void
    {
        $prefs = $this->getPrefs($user);

        if (!empty($prefs['emailNotifications']) && $prefs['emailNotifications']) {
            if ($user->email) {
                Mail::raw($message, function ($mail) use ($user, $subject) {
                    $mail->to($user->email)
                        ->subject($subject);
                });
            }
        }

        if (!empty($prefs['telegramEnabled']) && !empty($prefs['telegramChatId'])) {
            $this->telegram->sendMessage($prefs['telegramChatId'], "*{$subject}*\n\n{$message}");
        }
    }

    public function goalNearlyReached(User $user, Goal $goal): void
    {
        $target  = (float) $goal->target_amount;
        $current = (float) $goal->current_amount;

        if ($target <= 0) {
            return;
        }

        $remaining = $target - $current;
        $percentRemaining = ($remaining / $target) * 100;

        if ($percentRemaining > 20) {
            return;
        }

        $subject = 'PlanMore - Meta quase atingida 🎯';
        $message = sprintf(
            "Sua meta **%s** está a apenas *%.2f%%* de ser alcançada.\n\nFaltam R$ %.2f para atingir o objetivo de R$ %.2f.",
            $goal->name,
            $percentRemaining,
            $remaining,
            $target
        );

        $this->notify($user, $subject, $message);
    }

    public function inactiveUser(User $user, int $daysWithout = 2): void
    {
        $subject = 'PlanMore - Sentimos sua falta 👋';
        $message = sprintf(
            "Percebemos que você está há pelo menos %d dias sem lançar nenhuma transação.\n\nQue tal registrar seus gastos e receitas hoje para manter seu planejamento em dia?",
            $daysWithout
        );

        $this->notify($user, $subject, $message);
    }

    public function recurringExpenseCreated(User $user, Transaction $transaction): void
    {
        $subject = 'PlanMore - Despesa recorrente lançada automaticamente 🔁';

        $value = number_format($transaction->amount, 2, ',', '.');
        $date  = $transaction->date;

        $message = sprintf(
            "Uma despesa recorrente foi lançada automaticamente:\n\n- Descrição: %s\n- Valor: R$ %s\n- Data: %s",
            $transaction->description ?: '(sem descrição)',
            $value,
            $date
        );

        $this->notify($user, $subject, $message);
    }
}
