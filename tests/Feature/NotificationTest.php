<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_index_returns_200_for_authenticated_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/notifications');

        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_notifications()
    {
        $this->get('/notifications')->assertRedirect('/login');
    }
}
