<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['sku', 'product_name', 'selling_price', 'direct_labor_cost', 'overhead_cost', 'waste_percentage', 'description'];

    protected function casts(): array
    {
        return ['selling_price' => 'decimal:2', 'direct_labor_cost' => 'decimal:2', 'overhead_cost' => 'decimal:2', 'waste_percentage' => 'decimal:2'];
    }

    public function bomItems(): HasMany
    {
        return $this->hasMany(BomItem::class);
    }

    public function workInProgress(): HasMany
    {
        return $this->hasMany(WorkInProgress::class);
    }
}
