<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('goal_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained()->onDelete('cascade');
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('rule_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('goal_allocations');
    }
};
