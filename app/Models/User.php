<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\VerificationEmail;
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name', 'email', 'password',
        'provider_name', 'provider_id', 'avatar',
    ];
    
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerificationEmail);
    }

    public function isOauth()
    {
        return !is_null($this->provider_name) && !is_null($this->provider_id);
    }
    
    protected static function booted()
    {
        static::created(function ($user) {
            try {
                // Categorias padrão
                $defaultCategories = [
                    ['name' => 'Alimentação', 'type' => 'saida'],
                    ['name' => 'Transporte',  'type' => 'saida'],
                    ['name' => 'Moradia',     'type' => 'saida'],
                    ['name' => 'Educação',    'type' => 'saida'],
                    ['name' => 'Saúde',       'type' => 'saida'],
                    ['name' => 'Salário',     'type' => 'entrada'],
                    ['name' => 'Investimentos','type' => 'entrada'],
                ];

                foreach ($defaultCategories as $cat) {
                    \App\Models\Category::firstOrCreate([
                        'user_id' => $user->id,
                        'name'    => $cat['name'],
                        'type'    => $cat['type'],
                    ]);
                }

                // Grupos padrão
                $defaultGroups = ['Pessoal', 'Trabalho', 'Família'];

                foreach ($defaultGroups as $grp) {
                    \App\Models\Group::firstOrCreate([
                        'user_id' => $user->id,
                        'name'    => $grp,
                    ]);
                }
            } catch (\Throwable $e) {
                \Log::error('Erro ao criar categorias/grupos padrão para o usuário', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
            }
        });
    }
}
