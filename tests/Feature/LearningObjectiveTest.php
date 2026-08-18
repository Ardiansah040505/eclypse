<?php

namespace Tests\Feature;

use App\Models\LearningObjective;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningObjectiveTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test retrieving learning objectives.
     */
    public function test_can_get_learning_objectives(): void
    {
        LearningObjective::create(['text' => 'Tujuan Pembelajaran 1']);
        LearningObjective::create(['text' => 'Tujuan Pembelajaran 2']);

        $response = $this->getJson('/api/learning-objectives');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ])
                 ->assertJsonCount(2, 'data');
    }

    /**
     * Test creating a learning objective.
     */
    public function test_can_store_learning_objective(): void
    {
        $response = $this->postJson('/api/admin/learning-objectives', [
            'text' => 'Belajar menanggulangi pemanasan global.',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Tujuan pembelajaran berhasil ditambahkan',
                 ]);

        $this->assertDatabaseHas('learning_objectives', [
            'text' => 'Belajar menanggulangi pemanasan global.',
        ]);
    }

    /**
     * Test updating a learning objective.
     */
    public function test_can_update_learning_objective(): void
    {
        $objective = LearningObjective::create(['text' => 'Tujuan Awal']);

        $response = $this->putJson("/api/admin/learning-objectives/{$objective->id}", [
            'text' => 'Tujuan Baru',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Tujuan pembelajaran berhasil diubah',
                 ]);

        $this->assertDatabaseHas('learning_objectives', [
            'id' => $objective->id,
            'text' => 'Tujuan Baru',
        ]);
    }

    /**
     * Test deleting a learning objective.
     */
    public function test_can_delete_learning_objective(): void
    {
        $objective = LearningObjective::create(['text' => 'Tujuan yang akan dihapus']);

        $response = $this->deleteJson("/api/admin/learning-objectives/{$objective->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Tujuan pembelajaran berhasil dihapus',
                 ]);

        $this->assertDatabaseMissing('learning_objectives', [
            'id' => $objective->id,
        ]);
    }

    /**
     * Test storing a learning objective with HTML rich text formatting.
     */
    public function test_can_store_learning_objective_with_html_formatting(): void
    {
        $htmlContent = '<p>Memahami <strong>pemanasan global</strong> dan dampaknya.</p><ul><li>Causes</li><li>Effects</li></ul>';

        $response = $this->postJson('/api/admin/learning-objectives', [
            'text' => $htmlContent,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ]);

        $this->assertDatabaseHas('learning_objectives', [
            'text' => $htmlContent,
        ]);
    }

    /**
     * Test updating a learning objective with HTML rich text formatting.
     */
    public function test_can_update_learning_objective_with_html_formatting(): void
    {
        $objective = LearningObjective::create(['text' => 'Tujuan Awal']);

        $htmlContent = '<p><i>Updated</i> with <b>bold</b> and <u>underline</u>.</p>';

        $response = $this->putJson("/api/admin/learning-objectives/{$objective->id}", [
            'text' => $htmlContent,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                 ]);

        $this->assertDatabaseHas('learning_objectives', [
            'id' => $objective->id,
            'text' => $htmlContent,
        ]);
    }
}
