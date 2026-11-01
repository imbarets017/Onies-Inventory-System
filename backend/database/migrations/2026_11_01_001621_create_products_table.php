<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table): void {
                $table->id();
                $table->string('sku', 50)->unique();
                $table->string('product_name', 120);
                $table->decimal('selling_price', 12, 2)->default(0);
                $table->decimal('direct_labor_cost', 12, 2)->default(0);
                $table->decimal('overhead_cost', 12, 2)->default(0);
                $table->decimal('waste_percentage', 5, 2)->default(0);
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        // Inventory data may predate the Laravel migration history.
    }
};
