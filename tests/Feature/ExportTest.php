<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_excel_export_requires_authentication()
    {
        $this->get('/export/excel')->assertRedirect('/login');
    }

    public function test_pdf_export_requires_authentication()
    {
        $this->get('/export/pdf')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_export_excel()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/export/excel');

        $response->assertStatus(200)
                 ->assertHeader('content-disposition', 'attachment; filename=gastos-ganhos.xlsx');
    }
}
