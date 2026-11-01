<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->productListing(Product::query());
    }

    public function bomIndex(): JsonResponse
    {
        return $this->productListing(Product::query()->whereHas('bomItems'));
    }

    private function productListing(Builder $query): JsonResponse
    {
        $products = $query->with('bomItems.rawMaterial')->withSum('bomItems as direct_material_cost', DB::raw('quantity * unit_cost_snapshot'))->orderBy('product_name')->get();
        $data = $products->map(function (Product $product): array {
            $resource = (new ProductResource($product->loadMissing('bomItems.rawMaterial')))->resolve();
            $resource['direct_material_cost'] = (float) $product->direct_material_cost;
            $resource['total_unit_cost'] = $resource['direct_material_cost'] + (float) $product->direct_labor_cost + (float) $product->overhead_cost;
            $resource['gross_profit'] = (float) $product->selling_price - $resource['total_unit_cost'];
            $resource['gross_margin_pct'] = (float) $product->selling_price > 0 ? $resource['gross_profit'] / (float) $product->selling_price * 100 : 0;

            return $resource;
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        if (is_array($rows = $request->input('rows'))) {
            foreach ($rows as $row) {
                if (is_array($row)) {
                    DB::transaction(fn (): Product => $this->saveProduct(new Request($row)));
                }
            }

            return response()->json(['success' => true, 'count' => count($rows), 'message' => 'Products imported.']);
        }

        $product = DB::transaction(fn (): Product => $this->saveProduct($request));

        return (new ProductResource($product->load('bomItems.rawMaterial')))->response()->setStatusCode(201);
    }

    public function update(Request $request, Product $product): ProductResource
    {
        return new ProductResource(DB::transaction(fn (): Product => $this->saveProduct($request, $product))->load('bomItems.rawMaterial'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $hasProductionCosts = DB::table('production_costs')->where('product_id', $product->id)->exists();
        abort_if($product->workInProgress()->exists() || $hasProductionCosts, 409, 'This product has production records and cannot be deleted.');
        $product->delete();

        return response()->json(['success' => true]);
    }

    public function destroyAll(): JsonResponse
    {
        Product::query()->whereDoesntHave('workInProgress')->delete();

        return response()->json(['success' => true]);
    }

    private function saveProduct(Request $request, ?Product $product = null): Product
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($product?->id)],
            'product_name' => ['required', 'string', 'max:120'],
            'selling_price' => ['nullable', 'numeric', 'min:0'], 'direct_labor_cost' => ['nullable', 'numeric', 'min:0'],
            'overhead_cost' => ['nullable', 'numeric', 'min:0'], 'waste_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'description' => ['nullable', 'string'], 'materials' => ['sometimes', 'array'],
            'materials.*.raw_material_id' => ['required', 'integer', 'exists:raw_materials,id'], 'materials.*.quantity' => ['required', 'numeric', 'gt:0'],
        ]);
        $product ??= new Product;
        $product->fill(collect($data)->except('materials')->all());
        $product->save();

        if (array_key_exists('materials', $data)) {
            $product->bomItems()->delete();
            foreach ($data['materials'] as $material) {
                $product->bomItems()->create([
                    'raw_material_id' => $material['raw_material_id'], 'quantity' => $material['quantity'],
                    'unit_cost_snapshot' => DB::table('raw_materials')->where('id', $material['raw_material_id'])->value('unit_cost') ?? 0,
                ]);
            }
        }

        return $product;
    }
}
