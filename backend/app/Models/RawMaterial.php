<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RawMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_name', 'category', 'unit', 'unit_cost', 'beginning_stock', 'received', 'usage_gross', 'daily_usage',
        'annual_demand', 'lead_time_days', 'safety_stock_factor', 'holding_cost', 'ordering_cost', 'ending_stock',
        'ending_value', 'reorder_point', 'eoq', 'status',
    ];

    protected function casts(): array
    {
        return ['unit_cost' => 'decimal:2', 'beginning_stock' => 'decimal:2', 'received' => 'decimal:2', 'usage_gross' => 'decimal:2', 'ending_stock' => 'decimal:2', 'ending_value' => 'decimal:2', 'daily_usage' => 'decimal:2', 'annual_demand' => 'decimal:2', 'lead_time_days' => 'integer', 'safety_stock_factor' => 'decimal:2', 'reorder_point' => 'decimal:2', 'holding_cost' => 'decimal:2', 'ordering_cost' => 'decimal:2', 'eoq' => 'decimal:2'];
    }

    public function bomItems(): HasMany
    {
        return $this->hasMany(BomItem::class);
    }
}
