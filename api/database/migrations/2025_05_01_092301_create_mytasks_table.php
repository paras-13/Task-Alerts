<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mytasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('createdDate');
            $table->time('createdTime');
            $table->date('dueDate');
            $table->time('dueTime');
            $table->boolean('reminder')->default(false);
            $table->date('reminderDate')->nullable();
            $table->time('reminderTime')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('completed')->default(false);
            $table->boolean('reminder_sent')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mytasks');
    }
};
