<?php

namespace Database\Factories;

use App\Models\RawMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RawMaterial>
 */
class RawMaterialFactory extends Factory
{
    protected $model = RawMaterial::class;

    public function definition(): array
    {
        return [
            'material_name' => fake()->unique()->words(2, true),
            'category' => fake()->word(),
            'unit' => 'unit',
            'unit_cost' => fake()->randomFloat(2, 1, 100),
            'beginning_stock' => fake()->randomFloat(2, 0, 500),
            'received' => 0,
            'usage_gross' => 0,
            'daily_usage' => 1,
            'annual_demand' => 300,
            'lead_time_days' => 5,
            'safety_stock_factor' => 1,
            'holding_cost' => 1,
            'ordering_cost' => 10,
        ];
    }
}
