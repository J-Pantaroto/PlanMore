<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_dashboard()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_user_receives_dashboard_data()
    {
        $user = User::factory()->create();

        Transaction::factory()->create([
            'user_id' => $user->id,
            'type' => 'entrada',
            'amount' => 1000,
            'category' => 'Salário',
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'type' => 'saida',
            'amount' => 200,
            'category' => 'Alimentação',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200)
                 ->assertJson([
                     'saldo_atual' => 800,
                     'total_entradas' => 1000,
                     'total_saidas' => 200,
                 ])
                 ->assertJsonStructure([
                     'categorias' => [['category', 'total']]
                 ]);
    }
}
