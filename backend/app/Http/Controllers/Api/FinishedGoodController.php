<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FinishedGoodResource;
use App\Models\FinishedGood;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FinishedGoodController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => FinishedGoodResource::collection(FinishedGood::query()->orderBy('product_name')->get())->resolve()]);
    }

    public function store(Request $request): JsonResponse
    {
        if (is_array($rows = $request->input('rows'))) {
            foreach ($rows as $row) {
                if (is_array($row)) {
                    $row['sku'] = trim((string) ($row['sku'] ?? ''));
                    $existing = FinishedGood::query()->where('sku', $row['sku'])->first();
                    $data = $this->validatedData(new Request($row), $existing);
                    FinishedGood::query()->updateOrCreate(['sku' => $data['sku']], $this->computed($data));
                }
            }

            return response()->json(['success' => true, 'count' => count($rows), 'message' => 'Finished goods imported.']);
        }

        $item = FinishedGood::query()->create($this->computed($this->validatedData($request)));

        return (new FinishedGoodResource($item))->response()->setStatusCode(201);
    }

    public function update(Request $request, FinishedGood $finishedGood): FinishedGoodResource
    {
        $finishedGood->update($this->computed($this->validatedData($request, $finishedGood)));

        return new FinishedGoodResource($finishedGood->refresh());
    }

    public function destroy(FinishedGood $finishedGood): JsonResponse
    {
        $finishedGood->delete();

        return response()->json(['success' => true]);
    }

    private function validatedData(Request $request, ?FinishedGood $item = null): array
    {
        return $request->validate([
            'sku' => ['required', 'string', 'max:50', Rule::unique('finished_goods', 'sku')->ignore($item?->id)],
            'product_name' => ['required', 'string', 'max:120'], 'style' => ['nullable', 'string', 'max:120'], 'size' => ['nullable', 'string', 'max:30'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'], 'beginning_stock' => ['nullable', 'numeric', 'min:0'], 'beginning_pairs' => ['nullable', 'numeric', 'min:0'],
            'production' => ['nullable', 'numeric', 'min:0'], 'produced' => ['nullable', 'numeric', 'min:0'], 'sold' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['nullable', 'numeric', 'min:0'], 'monthly_sales_rate' => ['nullable', 'numeric', 'min:0'], 'avg_daily_sales' => ['nullable', 'numeric', 'min:0'],
            'lead_time' => ['nullable', 'integer', 'min:0'], 'lead_time_days' => ['nullable', 'integer', 'min:0'], 'buffer' => ['nullable', 'numeric', 'min:0'],
            'safety_stock' => ['nullable', 'numeric', 'min:0'], 'safety_stock_days' => ['nullable', 'numeric', 'min:0'],
            'ending_stock' => ['nullable', 'numeric', 'min:0'], 'ending_value' => ['nullable', 'numeric', 'min:0'],
            'reorder_point' => ['nullable', 'numeric', 'min:0'], 'days_of_stock' => ['nullable', 'numeric', 'min:0'],
        ]);
    }

    private function computed(array $data): array
    {
        $beginning = (float) ($data['beginning_stock'] ?? $data['beginning_pairs'] ?? 0);
        $production = (float) ($data['production'] ?? $data['produced'] ?? 0);
        $sold = (float) ($data['sold'] ?? 0);
        $unitCost = (float) ($data['unit_cost'] ?? 0);
        $salesRate = (float) ($data['monthly_sales_rate'] ?? $data['avg_daily_sales'] ?? 0);
        $leadTime = (int) ($data['lead_time'] ?? $data['lead_time_days'] ?? 0);
        $buffer = (float) ($data['buffer'] ?? $data['safety_stock_days'] ?? 0);
        $safetyStock = (float) ($data['safety_stock'] ?? $salesRate * $buffer);
        $ending = (float) ($data['ending_stock'] ?? $beginning + $production - $sold);
        $endingValue = (float) ($data['ending_value'] ?? $ending * $unitCost);
        $reorder = (float) ($data['reorder_point'] ?? ($salesRate * $leadTime) + $safetyStock);
        $daysOfStock = (float) ($data['days_of_stock'] ?? ($salesRate > 0 ? $ending / $salesRate : 0));

        return [
            'sku' => $data['sku'], 'product_name' => $data['product_name'] ?? $data['style'] ?? $data['sku'], 'size' => $data['size'] ?? 'N/A',
            'unit_cost' => $unitCost, 'beginning_stock' => $beginning, 'production' => $production, 'sold' => $sold, 'ending_stock' => $ending,
            'ending_value' => $endingValue, 'selling_price' => (float) ($data['selling_price'] ?? 0), 'monthly_sales_rate' => $salesRate,
            'lead_time' => $leadTime, 'buffer' => $buffer, 'safety_stock' => $safetyStock, 'reorder_point' => $reorder,
            'days_of_stock' => $daysOfStock, 'status' => $ending <= $reorder ? 'PRODUCE' : 'OK',
        ];
    }
}
