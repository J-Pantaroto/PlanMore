<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->enum('status', ['pendente', 'enviado'])->default('pendente');
            $table->datetime('scheduled_at');
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('notifications');
    }
};
