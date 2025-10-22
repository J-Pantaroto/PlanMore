<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',      
        'amount',
        'category_id',
        'group_id',
        'description',
        'is_fixed',
        'is_installment',
        'installments',
        'installment_number',
        'is_recurring',
        'recurrence_interval',
        'recurrence_end_date',
        'is_active',
        'date',
        'batch_id'
    ];

    protected $casts = [
        'date' => 'date',
        'is_fixed' => 'boolean',
        'is_installment' => 'boolean',
        'is_recurring' => 'boolean',
        'is_active' => 'boolean',
        'recurrence_end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
    
    public function allocations()
    {
        return $this->hasMany(GoalAllocation::class);
    }

}
