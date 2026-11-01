<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('finished_goods')) {
            return;
        }

        Schema::create('finished_goods', function (Blueprint $table): void {
            $table->id();
            $table->string('sku', 50)->unique();
            $table->string('product_name', 120);
            $table->string('size', 30)->default('N/A');
            $table->decimal('unit_cost', 12, 2)->default(0);
            $table->decimal('beginning_stock', 12, 2)->default(0);
            $table->decimal('production', 12, 2)->default(0);
            $table->decimal('sold', 12, 2)->default(0);
            $table->decimal('ending_stock', 12, 2)->default(0);
            $table->decimal('ending_value', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->decimal('monthly_sales_rate', 12, 2)->default(0);
            $table->unsignedInteger('lead_time')->default(0);
            $table->decimal('buffer', 12, 2)->default(0);
            $table->decimal('safety_stock', 12, 2)->default(0);
            $table->decimal('reorder_point', 12, 2)->default(0);
            $table->decimal('days_of_stock', 12, 2)->default(0);
            $table->string('status', 20)->default('OK');
            $table->timestamps();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finished_goods');
    }
};
