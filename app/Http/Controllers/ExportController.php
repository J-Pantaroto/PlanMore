<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\TransactionsExport;
use Illuminate\Support\Facades\Auth;


class ExportController extends Controller
{
    public function exportExcel()
    {
        return Excel::download(new TransactionsExport, 'gastos-ganhos.xlsx');
    }

    public function exportPDF()
    {
        $transactions = Transaction::where('user_id', Auth::id())->get();

        $pdf = Pdf::loadView('exports.transactions', compact('transactions'));

        return $pdf->download('relatorio-financeiro.pdf');
    }
}
