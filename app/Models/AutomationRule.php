<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AutomationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'rule_type',
        'match_text',
        'actions',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'actions' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

