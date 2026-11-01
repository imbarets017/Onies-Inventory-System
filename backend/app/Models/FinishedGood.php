<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinishedGood extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku', 'product_name', 'size', 'unit_cost', 'beginning_stock', 'production', 'sold', 'ending_stock', 'ending_value',
        'selling_price', 'monthly_sales_rate', 'lead_time', 'buffer', 'safety_stock', 'reorder_point', 'days_of_stock', 'status',
    ];

    protected function casts(): array
    {
        return ['unit_cost' => 'decimal:2', 'beginning_stock' => 'decimal:2', 'production' => 'decimal:2', 'sold' => 'decimal:2', 'ending_stock' => 'decimal:2', 'ending_value' => 'decimal:2', 'selling_price' => 'decimal:2', 'monthly_sales_rate' => 'decimal:2', 'lead_time' => 'integer', 'buffer' => 'decimal:2', 'safety_stock' => 'decimal:2', 'reorder_point' => 'decimal:2', 'days_of_stock' => 'decimal:2'];
    }
}
