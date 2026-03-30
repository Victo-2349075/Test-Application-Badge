<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'badge_created', 'badge_earned', 'ranking', 'system_reset'
            $table->foreignId('user_id')->nullable()->constrained('user')->onDelete('cascade');
            $table->foreignId('badge_id')->nullable()->constrained('badge')->onDelete('cascade');
            $table->integer('rank')->nullable(); // 1, 2, 3
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
