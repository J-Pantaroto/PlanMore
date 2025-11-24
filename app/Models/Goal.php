<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'current_amount',
        'type',
        'deadline',
        'description',
    ];

    protected $casts = [
        'target_amount'  => 'float',
        'current_amount' => 'float',
        'deadline'       => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
