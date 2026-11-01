<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'sku' => fake()->unique()->bothify('PROD-####'),
            'product_name' => fake()->words(2, true),
            'selling_price' => fake()->randomFloat(2, 20, 200),
            'direct_labor_cost' => fake()->randomFloat(2, 1, 20),
            'overhead_cost' => fake()->randomFloat(2, 1, 15),
            'waste_percentage' => fake()->randomFloat(2, 0, 10),
            'description' => fake()->sentence(),
        ];
    }
}
