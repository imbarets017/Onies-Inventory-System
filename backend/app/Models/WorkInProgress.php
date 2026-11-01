<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkInProgress extends Model
{
    use HasFactory;

    protected $table = 'work_in_progress';

    protected $fillable = ['product_id', 'batch_name', 'quantity_in_process', 'beginning_pairs', 'ending_pairs', 'avg_cost_per_pair', 'direct_material_cost', 'direct_labor_cost', 'overhead_cost', 'status'];

    protected function casts(): array
    {
        return ['quantity_in_process' => 'decimal:2', 'beginning_pairs' => 'decimal:2', 'ending_pairs' => 'decimal:2', 'avg_cost_per_pair' => 'decimal:2', 'direct_material_cost' => 'decimal:2', 'direct_labor_cost' => 'decimal:2', 'overhead_cost' => 'decimal:2'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
