<?php

namespace Database\Factories;

use App\Models\BomItem;
use App\Models\Product;
use App\Models\RawMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BomItem>
 */
class BomItemFactory extends Factory
{
    protected $model = BomItem::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'raw_material_id' => RawMaterial::factory(),
            'quantity' => fake()->randomFloat(3, 0.1, 5),
            'unit_cost_snapshot' => fake()->randomFloat(2, 1, 100),
        ];
    }
}
