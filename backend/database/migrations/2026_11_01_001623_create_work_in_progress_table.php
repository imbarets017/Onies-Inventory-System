<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('work_in_progress')) {
            Schema::create('work_in_progress', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('product_id')->constrained()->restrictOnDelete();
                $table->string('batch_name', 120);
                $table->decimal('quantity_in_process', 12, 2)->default(0);
                $table->decimal('direct_material_cost', 12, 2)->default(0);
                $table->decimal('direct_labor_cost', 12, 2)->default(0);
                $table->decimal('overhead_cost', 12, 2)->default(0);
                $table->string('status', 20)->default('OPEN');
                $table->timestamps();
                $table->unique(['product_id', 'batch_name']);
            });
        }

        if (! Schema::hasTable('production_costs')) {
            Schema::create('production_costs', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('product_id')->constrained()->restrictOnDelete();
                $table->date('period_month');
                $table->decimal('direct_material_cost', 12, 2)->default(0);
                $table->decimal('direct_labor_cost', 12, 2)->default(0);
                $table->decimal('overhead_cost', 12, 2)->default(0);
                $table->decimal('beginning_wip', 12, 2)->default(0);
                $table->decimal('ending_wip', 12, 2)->default(0);
                $table->decimal('cogs', 12, 2)->default(0);
                $table->decimal('cogm', 12, 2)->default(0);
                $table->timestamps();
                $table->unique(['product_id', 'period_month']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('production_costs');
        Schema::dropIfExists('work_in_progress');
    }
};
