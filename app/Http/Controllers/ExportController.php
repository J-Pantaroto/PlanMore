<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function exportExcel()
    {
        $userId = Auth::id();

        $transactions = Transaction::where('user_id', $userId)->get();

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Data', 'Tipo', 'Valor', 'Categoria']);
            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->date,
                    $t->type,
                    $t->amount,
                    optional($t->category)->name ?? '-',
                ]);
            }
            fclose($file);
        };

        return response()->streamDownload($callback, 'transacoes.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportPDF()
    {
        $userId = Auth::id();

        $transactions = Transaction::with('category')
            ->where('user_id', $userId)
            ->get();

        $pdf = Pdf::loadView('exports.transactions', [
            'transactions' => $transactions,
        ]);

        return $pdf->download('transacoes.pdf');
    }
}
