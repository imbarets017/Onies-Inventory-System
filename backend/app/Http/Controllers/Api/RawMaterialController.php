<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RawMaterialResource;
use App\Models\RawMaterial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RawMaterialController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => RawMaterialResource::collection(RawMaterial::query()->orderBy('material_name')->get())->resolve()]);
    }

    public function store(Request $request): JsonResponse
    {
        $rows = $request->input('rows');
        if (is_array($rows)) {
            $saved = DB::transaction(function () use ($rows): int {
                foreach ($rows as $row) {
                    if (! is_array($row)) {
                        continue;
                    }
                    $row['material_name'] = trim((string) ($row['material_name'] ?? ''));
                    $existing = RawMaterial::query()->where('material_name', $row['material_name'])->first();
                    $data = $this->validatedData(new Request($row), $existing);
                    RawMaterial::query()->updateOrCreate(['material_name' => $data['material_name']], $this->computed($data));
                }

                return count($rows);
            });

            return response()->json(['success' => true, 'count' => $saved, 'message' => 'Raw materials imported.']);
        }

        $data = $this->validatedData($request);
        $item = RawMaterial::query()->create($this->computed($data));

        return (new RawMaterialResource($item))->response()->setStatusCode(201);
    }

    public function update(Request $request, RawMaterial $rawMaterial): RawMaterialResource
    {
        $data = $this->validatedData($request, $rawMaterial);
        $rawMaterial->update($this->computed($data));

        return new RawMaterialResource($rawMaterial->refresh());
    }

    public function destroy(RawMaterial $rawMaterial): JsonResponse
    {
        $rawMaterial->delete();

        return response()->json(['success' => true]);
    }

    private function validatedData(Request $request, ?RawMaterial $item = null): array
    {
        return $request->validate([
            'material_name' => ['required', 'string', 'max:100', Rule::unique('raw_materials', 'material_name')->ignore($item?->id)],
            'category' => ['nullable', 'string', 'max:50'],
            'unit' => ['required', 'string', 'max:30'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'beginning_stock' => ['nullable', 'numeric', 'min:0'],
            'beginning_qty' => ['nullable', 'numeric', 'min:0'],
            'received' => ['nullable', 'numeric', 'min:0'],
            'usage_gross' => ['nullable', 'numeric', 'min:0'],
            'used' => ['nullable', 'numeric', 'min:0'],
            'daily_usage' => ['nullable', 'numeric', 'min:0'],
            'avg_daily_usage' => ['nullable', 'numeric', 'min:0'],
            'annual_demand' => ['nullable', 'numeric', 'min:0'],
            'annual_usage' => ['nullable', 'numeric', 'min:0'],
            'lead_time_days' => ['nullable', 'integer', 'min:0'],
            'safety_stock_factor' => ['nullable', 'numeric', 'min:0'],
            'holding_pct' => ['nullable', 'numeric', 'min:0'],
            'holding_cost' => ['nullable', 'numeric', 'min:0'],
            'ordering_cost' => ['nullable', 'numeric', 'min:0'],
            'order_cost' => ['nullable', 'numeric', 'min:0'],
            'ending_stock' => ['nullable', 'numeric', 'min:0'],
            'ending_qty' => ['nullable', 'numeric', 'min:0'],
            'ending_value' => ['nullable', 'numeric', 'min:0'],
            'inventory_value' => ['nullable', 'numeric', 'min:0'],
            'reorder_point' => ['nullable', 'numeric', 'min:0'],
            'eoq' => ['nullable', 'numeric', 'min:0'],
            'max_daily_usage' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', Rule::in(['OK', 'REORDER'])],
        ]);
    }

    private function computed(array $data): array
    {
        $beginning = (float) ($data['beginning_stock'] ?? $data['beginning_qty'] ?? 0);
        $received = (float) ($data['received'] ?? 0);
        $used = (float) ($data['usage_gross'] ?? $data['used'] ?? 0);
        $unitCost = (float) $data['unit_cost'];
        $dailyUsage = (float) ($data['daily_usage'] ?? $data['avg_daily_usage'] ?? 0);
        $leadTime = (int) ($data['lead_time_days'] ?? 0);
        $annualDemand = (float) ($data['annual_demand'] ?? $data['annual_usage'] ?? 0);
        $holdingCost = (float) ($data['holding_cost'] ?? $data['holding_pct'] ?? 0);
        $orderingCost = (float) ($data['ordering_cost'] ?? $data['order_cost'] ?? 0);
        $safetyFactor = (float) ($data['safety_stock_factor'] ?? 0);
        $ending = (float) ($data['ending_stock'] ?? $data['ending_qty'] ?? $beginning + $received - $used);
        $endingValue = (float) ($data['ending_value'] ?? $data['inventory_value'] ?? $ending * $unitCost);
        $reorderPoint = (float) ($data['reorder_point'] ?? $dailyUsage * ($leadTime + $safetyFactor));
        $eoq = (float) ($data['eoq'] ?? ($annualDemand > 0 && $orderingCost > 0 && $holdingCost > 0 && $unitCost > 0 ? sqrt((2 * $annualDemand * $orderingCost) / ($holdingCost * $unitCost)) : 0));
        $status = $data['status'] ?? ($ending <= $reorderPoint ? 'REORDER' : 'OK');

        return [
            'material_name' => $data['material_name'], 'category' => $data['category'] ?? 'General', 'unit' => $data['unit'], 'unit_cost' => $unitCost,
            'beginning_stock' => $beginning, 'received' => $received, 'usage_gross' => $used, 'ending_stock' => $ending, 'ending_value' => $endingValue,
            'daily_usage' => $dailyUsage, 'annual_demand' => $annualDemand, 'lead_time_days' => $leadTime, 'safety_stock_factor' => $safetyFactor,
            'reorder_point' => $reorderPoint, 'holding_cost' => $holdingCost, 'ordering_cost' => $orderingCost, 'eoq' => $eoq, 'status' => $status,
        ];
    }
}
