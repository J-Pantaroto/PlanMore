<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithTitle
{
    protected Collection $transactions;

    public function __construct(Collection $transactions)
    {
        $this->transactions = $transactions;
    }

    public function collection(): Collection
    {
        return $this->transactions;
    }

    public function headings(): array
    {
        return [
            'Data',
            'Tipo',
            'Valor (R$)',
            'Categoria',
            'Grupo',
            'Descrição',
        ];
    }

    public function map($t): array
    {
        return [
            optional($t->date)->format('d/m/Y'),
            $t->type === 'entrada' ? 'Entrada' : 'Saída',
            number_format($t->amount, 2, ',', '.'),
            optional($t->category)->name ?? '-',
            optional($t->group)->name ?? '-',
            $t->description ?? '-',
        ];
    }

    public function title(): string
    {
        return 'Transações';
    }
}
