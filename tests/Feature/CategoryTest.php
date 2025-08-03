<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_category()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/categories', [
            'name' => 'Alimentação',
            'type' => 'saida',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Categoria criada com sucesso!']);
    }

    public function test_guest_cannot_create_category()
    {
        $this->post('/categories', [])->assertRedirect('/login');
    }
}
