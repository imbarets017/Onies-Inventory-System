<?php

namespace Database\Factories;

use App\Models\FinishedGood;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinishedGood>
 */
class FinishedGoodFactory extends Factory
{
    protected $model = FinishedGood::class;

    public function definition(): array
    {
        return [
            'sku' => fake()->unique()->bothify('SKU-####'),
            'product_name' => fake()->words(2, true),
            'size' => 'N/A',
            'unit_cost' => 25,
            'beginning_stock' => 10,
            'production' => 0,
            'sold' => 0,
            'selling_price' => 50,
        ];
    }
}
