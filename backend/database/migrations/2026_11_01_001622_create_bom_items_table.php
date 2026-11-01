<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bom_items')) {
            Schema::create('bom_items', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->foreignId('raw_material_id')->constrained('raw_materials')->cascadeOnDelete();
                $table->decimal('quantity', 12, 3)->default(0);
                $table->decimal('unit_cost_snapshot', 12, 2)->default(0);
                $table->timestamp('created_at')->nullable();
                $table->unique(['product_id', 'raw_material_id']);
            });
        }
    }

    public function down(): void
    {
        // Preserve pre-existing BOM records when rolling back migrations.
    }
};
