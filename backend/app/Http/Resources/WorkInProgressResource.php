<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkInProgressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $beginningPairs = (float) $this->beginning_pairs;
        $endingPairs = (float) $this->ending_pairs;
        $averageCost = (float) $this->avg_cost_per_pair;

        return [
            ...$this->resource->toArray(),
            'sku' => $this->product?->sku,
            'product_name' => $this->product?->product_name,
            'stage' => $this->batch_name,
            'beginning_pairs' => $beginningPairs,
            'ending_pairs' => $endingPairs,
            'avg_cost_per_pair' => $averageCost,
            'beginning_value' => $beginningPairs * $averageCost,
            'ending_value' => $endingPairs * $averageCost,
        ];
    }
}
