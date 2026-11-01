<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\WorkInProgress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkInProgress>
 */
class WorkInProgressFactory extends Factory
{
    protected $model = WorkInProgress::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'batch_name' => fake()->unique()->bothify('Batch-####'),
            'quantity_in_process' => fake()->numberBetween(1, 500),
            'direct_material_cost' => fake()->randomFloat(2, 10, 5000),
            'direct_labor_cost' => fake()->randomFloat(2, 10, 5000),
            'overhead_cost' => fake()->randomFloat(2, 10, 5000),
            'status' => 'OPEN',
        ];
    }
}
