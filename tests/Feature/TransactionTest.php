<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_transactions_index()
    {
        $response = $this->get('/transactions');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_transactions_index()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/transactions');

        $response->assertStatus(200);
    }
}
