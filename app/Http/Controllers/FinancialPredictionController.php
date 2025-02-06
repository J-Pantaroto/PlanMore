<?php

namespace App\Http\Controllers;

use App\Models\FinancialPrediction;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FinancialPredictionController extends Controller
{
    public function generatePredictions()
    {
        $user_id = Auth::id();
        $transactions = Transaction::where('user_id', $user_id)->get();

        $predictions = [];

        foreach ($transactions as $transaction) {
            $month = date('m', strtotime($transaction->date));
            $year = date('Y', strtotime($transaction->date));

            if (!isset($predictions["$year-$month"])) {
                $predictions["$year-$month"] = [
                    'total_income' => 0,
                    'total_expense' => 0,
                ];
            }

            if ($transaction->type === 'entrada') {
                $predictions["$year-$month"]['total_income'] += $transaction->amount;
            } else {
                $predictions["$year-$month"]['total_expense'] += $transaction->amount;
            }
        }

        foreach ($predictions as $key => $values) {
            [$year, $month] = explode('-', $key);

            FinancialPrediction::updateOrCreate(
                ['user_id' => $user_id, 'month' => $month, 'year' => $year],
                [
                    'total_income' => $values['total_income'],
                    'total_expense' => $values['total_expense'],
                    'balance' => $values['total_income'] - $values['total_expense'],
                ]
            );
        }

        return response()->json(['message' => 'Previsões financeiras geradas com sucesso!']);
    }
}
