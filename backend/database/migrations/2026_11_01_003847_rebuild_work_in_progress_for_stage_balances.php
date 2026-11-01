<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_in_progress', function (Blueprint $table): void {
            $table->dropForeign('fk_wip_product');
            $table->integer('product_id')->nullable()->change();
            $table->foreign('product_id', 'fk_wip_product')->references('id')->on('products')->restrictOnDelete();
            $table->decimal('beginning_pairs', 12, 2)->default(0);
            $table->decimal('ending_pairs', 12, 2)->default(0);
            $table->decimal('avg_cost_per_pair', 12, 2)->default(0);
        });

        DB::statement('UPDATE work_in_progress SET beginning_pairs = quantity_in_process, ending_pairs = quantity_in_process, avg_cost_per_pair = CASE WHEN quantity_in_process > 0 THEN (direct_material_cost + direct_labor_cost + overhead_cost) / quantity_in_process ELSE 0 END');
    }

    public function down(): void
    {
        if (DB::table('work_in_progress')->whereNull('product_id')->exists()) {
            throw new RuntimeException('Assign product records to plant-wide WIP stages before rolling back this migration.');
        }

        Schema::table('work_in_progress', function (Blueprint $table): void {
            $table->dropForeign('fk_wip_product');
            $table->integer('product_id')->nullable(false)->change();
            $table->foreign('product_id', 'fk_wip_product')->references('id')->on('products')->restrictOnDelete();
            $table->dropColumn(['beginning_pairs', 'ending_pairs', 'avg_cost_per_pair']);
        });
    }
};
