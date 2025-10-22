<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GoalAllocation extends Model
{
    use HasFactory;

    protected $fillable = ['goal_id', 'transaction_id', 'amount', 'rule_name'];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function goal() {
        return $this->belongsTo(Goal::class);
    }

    public function transaction() {
        return $this->belongsTo(Transaction::class);
    }
}
