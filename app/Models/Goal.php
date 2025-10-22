<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    public function allocations()
    {
        return $this->hasMany(GoalAllocation::class);
    }

    public function getProgressAttribute()
    {
        $total = $this->allocations()->sum('amount');
        return min(($total / max($this->target_amount, 1)) * 100, 100);
    }
}
