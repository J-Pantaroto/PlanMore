<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>PlanMore - Relatório financeiro</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #111827;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
        }
        .logo {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 700;
            font-size: 16px;
        }
        .logo img {
            height: 22px;
        }
        .header-right {
            text-align: right;
            font-size: 10px;
            color: #6b7280;
        }
        h1 {
            font-size: 14px;
            margin: 0;
            color: #111827;
        }
        .section-title {
            font-weight: 600;
            margin: 16px 0 6px;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
        }
        th {
            background: #f9fafb;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
        }
        td {
            font-size: 10px;
        }
        .summary-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        .summary-grid td {
            border: 1px solid #e5e7eb;
            padding: 8px 10px;
            font-size: 10px;
        }
        .summary-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 4px;
        }
        .summary-value {
            font-size: 12px;
            font-weight: 700;
        }
        .green { color: #16a34a; }
        .red   { color: #dc2626; }
        .bar-wrapper {
            width: 100%;
            background: #f3f4f6;
            border-radius: 999px;
            overflow: hidden;
            height: 8px;
        }
        .bar-inner {
            height: 8px;
            background: #6366f1;
        }
        .muted {
            color: #6b7280;
            font-size: 9px;
        }
        .text-right { text-align: right; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="{{ public_path('img/logo.png') }}" alt="PlanMore">
            <span>PlanMore</span>
        </div>
        <div class="header-right">
            <div>Relatório financeiro</div>
            @if($from && $to)
                <div>Período: {{ \Carbon\Carbon::parse($from)->format('d/m/Y') }}
                    — {{ \Carbon\Carbon::parse($to)->format('d/m/Y') }}</div>
            @endif
            <div>Gerado em: {{ now()->format('d/m/Y H:i') }}</div>
            <div>Usuário: {{ $user->name ?? $user->email ?? ('ID '.$user->id) }}</div>
        </div>
    </div>

    <div class="section-title">Resumo financeiro do período</div>
    <table class="summary-grid">
        <tr>
            <td>
                <div class="summary-label">Total de entradas</div>
                <div class="summary-value green">
                    R$ {{ number_format($totalEntradas, 2, ',', '.') }}
                </div>
            </td>
            <td>
                <div class="summary-label">Total de saídas</div>
                <div class="summary-value red">
                    R$ {{ number_format($totalSaidas, 2, ',', '.') }}
                </div>
            </td>
            <td>
                <div class="summary-label">Saldo do período</div>
                @php
                    $saldoClass = $saldoPeriodo > 0 ? 'green' : ($saldoPeriodo < 0 ? 'red' : '');
                @endphp
                <div class="summary-value {{ $saldoClass }}">
                    R$ {{ number_format($saldoPeriodo, 2, ',', '.') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">Distribuição de despesas por categoria</div>
    @if($porCategoria->isEmpty())
        <p class="muted">Não há despesas no período selecionado.</p>
    @else
        @foreach($porCategoria as $item)
            <div class="mt-2">
                <div style="display:flex; justify-content:space-between; font-size:10px;">
                    <span>{{ $item['categoria'] }}</span>
                    <span>
                        R$ {{ number_format($item['total'], 2, ',', '.') }}
                        ({{ number_format($item['percentual'], 1, ',', '.') }}%)
                    </span>
                </div>
                <div class="bar-wrapper">
                    <div class="bar-inner" style="width: {{ min(100, $item['percentual']) }}%;"></div>
                </div>
            </div>
        @endforeach
    @endif

    <div class="section-title mt-3">Transações detalhadas</div>
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th class="text-right">Valor</th>
                <th>Categoria</th>
                <th>Descrição</th>
            </tr>
        </thead>
        <tbody>
        @forelse($transactions as $t)
            <tr>
                <td>{{ \Carbon\Carbon::parse($t->date)->format('d/m/Y') }}</td>
                <td>{{ $t->type === 'entrada' ? 'Entrada' : 'Saída' }}</td>
                <td class="text-right">
                    R$ {{ number_format($t->amount, 2, ',', '.') }}
                </td>
                <td>{{ optional($t->category)->name ?? '-' }}</td>
                <td>{{ $t->description ?? '' }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="5" class="muted">Nenhuma transação encontrada para o período.</td>
            </tr>
        @endforelse
        </tbody>
    </table>
</body>
</html>
