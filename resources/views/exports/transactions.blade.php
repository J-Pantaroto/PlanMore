<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Transações</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Relatório de Transações</h2>
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Categoria</th>
            </tr>
        </thead>
        <tbody>
        @foreach($transactions as $t)
            <tr>
                <td>{{ $t->date }}</td>
                <td>{{ ucfirst($t->type) }}</td>
                <td>R$ {{ number_format($t->amount, 2, ',', '.') }}</td>
                <td>{{ $t->category->name ?? '-' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</body>
</html>
