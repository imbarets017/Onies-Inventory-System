<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            ...$this->resource->toArray(),
            'materials' => $this->whenLoaded('bomItems', fn () => $this->bomItems->map(fn ($item): array => [
                'raw_material_id' => $item->raw_material_id,
                'material_name' => $item->rawMaterial?->material_name,
                'unit' => $item->rawMaterial?->unit,
                'quantity' => $item->quantity,
                'unit_cost_snapshot' => $item->unit_cost_snapshot,
            ])),
            'selected_material_ids' => $this->whenLoaded('bomItems', fn () => $this->bomItems->pluck('raw_material_id')),
        ];
    }
}
