<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BomItem extends Model
{
    public $timestamps = false;

    use HasFactory;

    protected $fillable = ['product_id', 'raw_material_id', 'quantity', 'unit_cost_snapshot'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3', 'unit_cost_snapshot' => 'decimal:2'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function rawMaterial(): BelongsTo
    {
        return $this->belongsTo(RawMaterial::class);
    }
}
