<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id ?? null;
            $from = $request->date('from') ?? now()->startOfMonth()->toDateString();
            $to   = $request->date('to')   ?? now()->endOfMonth()->toDateString();
            $type = $request->get('type'); // "", "entrada", "saida"

            $txTable = Schema::hasTable('transactions') ? 'transactions' : (Schema::hasTable('transacoes') ? 'transacoes' : null);
            if (!$txTable) {
                return response()->json(['error' => 'Tabela de transações não encontrada'], 500);
            }

            $dateCol = Schema::hasColumn($txTable, 'date') ? 'date'
                : (Schema::hasColumn($txTable, 'data') ? 'data'
                : (Schema::hasColumn($txTable, 'transaction_date') ? 'transaction_date' : null));

            if (!$dateCol) {
                return response()->json(['error' => 'Coluna de data não encontrada nas transações'], 500);
            }

            $amountCol   = Schema::hasColumn($txTable, 'amount') ? 'amount' : (Schema::hasColumn($txTable, 'valor') ? 'valor' : null);
            $typeCol     = Schema::hasColumn($txTable, 'type')   ? 'type'   : (Schema::hasColumn($txTable, 'tipo')  ? 'tipo'  : null);
            $catIdCol    = Schema::hasColumn($txTable, 'category_id') ? 'category_id' : (Schema::hasColumn($txTable, 'categoria_id') ? 'categoria_id' : null);
            $userIdCol   = Schema::hasColumn($txTable, 'user_id') ? 'user_id' : null;
            $isFixedCol  = Schema::hasColumn($txTable, 'is_fixed') ? 'is_fixed' : null;
            $isInstCol   = Schema::hasColumn($txTable, 'is_installment') ? 'is_installment' : null;

            if (!$amountCol || !$typeCol) {
                return response()->json(['error' => 'Colunas amount/tipo não encontradas nas transações'], 500);
            }

            $base = DB::table($txTable)->whereBetween($dateCol, [$from, $to]);

            if ($userId && $userIdCol) $base->where($userIdCol, $userId);
            if ($type === 'entrada')   $base->where($typeCol, 'entrada');
            if ($type === 'saida')     $base->where($typeCol, 'saida');

            $entradas = (clone $base)->where($typeCol, 'entrada')->sum($amountCol);
            $saidas   = (clone $base)->where($typeCol, 'saida')->sum($amountCol);

            $saldoAteOntemQuery = DB::table($txTable)->where($dateCol, '<', Carbon::parse($from)->startOfDay());
            if ($userId && $userIdCol) $saldoAteOntemQuery->where($userIdCol, $userId);

            $saldoAteOntem = (float) (
                ($saldoAteOntemQuery->where($typeCol, 'entrada')->sum($amountCol) ?: 0)
                -
                (DB::table($txTable)
                    ->where($dateCol, '<', Carbon::parse($from)->startOfDay())
                    ->when($userId && $userIdCol, fn($q)=>$q->where($userIdCol,$userId))
                    ->where($typeCol, 'saida')
                    ->sum($amountCol) ?: 0)
            );

            $saldoAtualQuery = DB::table($txTable)->where($dateCol, '<=', now()->toDateString());
            if ($userId && $userIdCol) $saldoAtualQuery->where($userIdCol, $userId);
            $saldoAtual = (float)(
                ($saldoAtualQuery->where($typeCol, 'entrada')->sum($amountCol) ?: 0)
                -
                (DB::table($txTable)
                    ->where($dateCol, '<=', now()->toDateString())
                    ->when($userId && $userIdCol, fn($q)=>$q->where($userIdCol,$userId))
                    ->where($typeCol, 'saida')
                    ->sum($amountCol) ?: 0)
            );

            $serie = DB::table($txTable)
                ->selectRaw("$dateCol as date,
                    SUM(CASE WHEN $typeCol = 'entrada' THEN $amountCol ELSE 0 END) as entradas,
                    SUM(CASE WHEN $typeCol = 'saida'   THEN $amountCol ELSE 0 END) as saidas")
                ->whereBetween($dateCol, [$from, $to])
                ->when($userId && $userIdCol, fn($q)=>$q->where($userIdCol,$userId))
                ->when($type === 'entrada', fn($q)=>$q->where($typeCol,'entrada'))
                ->when($type === 'saida',   fn($q)=>$q->where($typeCol,'saida'))
                ->groupBy($dateCol)
                ->orderBy($dateCol)
                ->get();

            $top = [];
            if ($catIdCol && Schema::hasTable('categories')) {
                $catTable = 'categories';
                $catNameCol = Schema::hasColumn($catTable, 'name') ? 'name'
                    : (Schema::hasColumn($catTable, 'nome') ? 'nome' : null);

                if ($catNameCol) {
                    $top = DB::table($txTable)
                        ->join($catTable, "$catTable.id", '=', "$txTable.$catIdCol")
                        ->whereBetween("$txTable.$dateCol", [$from, $to])
                        ->when($userId && $userIdCol, fn($q)=>$q->where("$txTable.$userIdCol",$userId))
                        ->where("$txTable.$typeCol", 'saida')
                        ->groupBy("$catTable.$catNameCol")
                        ->selectRaw("$catTable.$catNameCol as categoria, SUM($txTable.$amountCol) as total")
                        ->orderByDesc('total')
                        ->limit(5)
                        ->get();
                }
            }

            $fixas = $isFixedCol ? (clone $base)->where($typeCol,'saida')->where($isFixedCol,true)->sum($amountCol) : 0;
            $vari  = $isFixedCol ? (clone $base)->where($typeCol,'saida')->where($isFixedCol,false)->sum($amountCol) : 0;
            $parcelasQtd   = $isInstCol ? (clone $base)->where($isInstCol,true)->count() : 0;
            $parcelasValor = $isInstCol ? (clone $base)->where($isInstCol,true)->sum($amountCol) : 0;

            $dias = max(1, Carbon::parse($from)->diffInDays(Carbon::parse($to)) + 1);
            $burn = (float) $saidas / $dias;
            $runway = $burn > 0 ? (int) floor($saldoAtual / $burn) : null;

            return response()->json([
                'period' => compact('from','to'),
                'saldo_inicial'    => (float)$saldoAteOntem,
                'saldo_atual'      => (float)$saldoAtual,
                'entradas_periodo' => (float)$entradas,
                'saidas_periodo'   => (float)$saidas,
                'saldo_periodo'    => (float)($entradas - $saidas),
                'burn_rate_dia'    => round($burn, 2),
                'runway_dias'      => $runway,
                'top_categorias'   => $top,
                'fixas_vs_variaveis' => ['fixas'=>(float)$fixas, 'variaveis'=>(float)$vari],
                'parcelas'         => ['qtd'=>$parcelasQtd, 'valor'=>(float)$parcelasValor],
                'serie_diaria'     => $serie,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Dashboard error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Falha ao montar dashboard', 'detail' => $e->getMessage()], 500);
        }
    }
}
