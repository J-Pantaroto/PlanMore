<!DOCTYPE html>
<html>
<head>
    <title>Relatório Financeiro</title>
</head>
<body>
    <h1>Relatório de Gastos e Ganhos</h1>
    <table border="1">
        <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Valor</th>
        </tr>
        @foreach($transactions as $transaction)
            <tr>
                <td>{{ $transaction->date }}</td>
                <td>{{ $transaction->description }}</td>
                <td>{{ ucfirst($transaction->type) }}</td>
                <td>R$ {{ number_format($transaction->amount, 2, ',', '.') }}</td>
            </tr>
        @endforeach
    </table>
</body>
</html>
