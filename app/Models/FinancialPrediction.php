<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPrediction extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'month', 'year', 'total_income', 'total_expense', 'balance'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
