<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoalTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_goals()
    {
        $this->get('/goals')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_list_goals()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
             ->get('/goals')
             ->assertStatus(200);
    }

    public function test_user_can_create_goal()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/goals', [
            'name' => 'Comprar carro',
            'target_amount' => 15000,
            'deadline' => now()->addMonths(6)->toDateString(),
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Meta financeira criada!']);
    }

    public function test_goal_creation_requires_fields()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/goals', []);

        $response->assertSessionHasErrors(['name', 'target_amount']);
    }
}