<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkInProgressResource;
use App\Models\Product;
use App\Models\WorkInProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkInProgressController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = WorkInProgress::query()->with('product')->orderBy('batch_name')->get();

        return response()->json(['success' => true, 'data' => WorkInProgressResource::collection($rows)->resolve()]);
    }

    public function store(Request $request): JsonResponse
    {
        if (is_array($rows = $request->input('rows'))) {
            foreach ($rows as $row) {
                if (is_array($row)) {
                    $this->saveRow(new Request($row));
                }
            }

            return response()->json(['success' => true, 'count' => count($rows)]);
        }
        $record = $this->saveRow($request);

        return (new WorkInProgressResource($record->load('product')))->response()->setStatusCode(201);
    }

    public function update(Request $request, WorkInProgress $workInProgress): WorkInProgressResource
    {
        return new WorkInProgressResource($this->saveRow($request, $workInProgress)->load('product'));
    }

    public function destroy(WorkInProgress $workInProgress): JsonResponse
    {
        $workInProgress->delete();

        return response()->json(['success' => true]);
    }

    private function saveRow(Request $request, ?WorkInProgress $record = null): WorkInProgress
    {
        $data = $request->validate([
            'product_id' => ['nullable', 'integer', 'exists:products,id'], 'sku' => ['nullable', 'exists:products,sku'],
            'batch_name' => ['required', 'string', 'max:120'],
            'beginning_pairs' => ['required', 'numeric', 'min:0'], 'ending_pairs' => ['required', 'numeric', 'min:0'],
            'avg_cost_per_pair' => ['required', 'numeric', 'min:0'], 'status' => ['nullable', 'in:OPEN,CLOSED'],
        ]);
        if (isset($data['sku'])) {
            $data['product_id'] = Product::query()->where('sku', $data['sku'])->value('id');
        }
        $record ??= new WorkInProgress;
        $record->fill([
            ...$data,
            'quantity_in_process' => $data['ending_pairs'],
            'direct_material_cost' => 0,
            'direct_labor_cost' => 0,
            'overhead_cost' => 0,
            'status' => $data['status'] ?? 'OPEN',
        ]);
        $record->save();

        return $record;
    }
}
