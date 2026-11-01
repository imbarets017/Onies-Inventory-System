<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('raw_materials')) {
            Schema::create('raw_materials', function (Blueprint $table): void {
                $table->id();
                $table->string('material_name', 100)->unique();
                $table->string('category', 50)->default('General');
                $table->string('unit', 30)->default('unit');
                $table->decimal('unit_cost', 12, 2)->default(0);
                $table->decimal('beginning_stock', 12, 2)->default(0);
                $table->decimal('received', 12, 2)->default(0);
                $table->decimal('usage_gross', 12, 2)->default(0);
                $table->decimal('ending_stock', 12, 2)->default(0);
                $table->decimal('ending_value', 12, 2)->default(0);
                $table->decimal('daily_usage', 12, 2)->default(0);
                $table->decimal('annual_demand', 12, 2)->default(0);
                $table->unsignedInteger('lead_time_days')->default(0);
                $table->decimal('safety_stock_factor', 8, 2)->default(0);
                $table->decimal('reorder_point', 12, 2)->default(0);
                $table->decimal('holding_cost', 12, 2)->default(0);
                $table->decimal('ordering_cost', 12, 2)->default(0);
                $table->decimal('eoq', 12, 2)->default(0);
                $table->string('status', 20)->default('OK');
                $table->timestamps();
                $table->index('category');
                $table->index('status');
            });
        }

        if (! Schema::hasTable('raw_material_transactions')) {
            Schema::create('raw_material_transactions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('raw_material_id')->constrained('raw_materials')->cascadeOnDelete();
                $table->string('transaction_type', 20);
                $table->decimal('quantity', 12, 2)->default(0);
                $table->decimal('unit_cost', 12, 2)->default(0);
                $table->string('reference_no')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // Inventory tables may predate the Laravel migration history.
    }
};
