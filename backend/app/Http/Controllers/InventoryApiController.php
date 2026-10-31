<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryApiController extends Controller
{
    public function rawMaterials()
    {
        $rows = DB::table('raw_materials')
            ->select([
                'id',
                'material_name',
                'category',
                'unit',
                'unit_cost',
                'beginning_stock',
                'received',
                'usage_gross',
                'ending_stock',
                'ending_value',
                'daily_usage',
                'annual_demand',
                'lead_time_days',
                'safety_stock_factor',
                'reorder_point',
                'holding_cost',
                'ordering_cost',
                'eoq',
                'status',
            ])
            ->orderBy('material_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rows,
        ]);
    }

    public function storeRawMaterials(Request $request)
    {
        $payload = $request->json()->all();
        $rows = $payload['rows'] ?? $payload;

        if (! is_array($rows) || $rows === []) {
            return response()->json([
                'success' => false,
                'message' => 'No payload provided.',
            ], 400);
        }

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $materialName = trim((string) ($row['material_name'] ?? $row['name'] ?? ''));
            if ($materialName === '') {
                continue;
            }

            $unitCost = (float) ($row['unit_cost'] ?? 0);
            $beginningStock = (float) ($row['beginning_stock'] ?? $row['beginning_qty'] ?? 0);
            $received = (float) ($row['received'] ?? 0);
            $usageGross = (float) ($row['usage_gross'] ?? $row['used'] ?? 0);
            $dailyUsage = (float) ($row['daily_usage'] ?? $row['avg_daily_usage'] ?? 0);
            $leadTimeDays = (float) ($row['lead_time_days'] ?? $row['lead_time'] ?? 0);
            $safetyStockFactor = (float) ($row['safety_stock_factor'] ?? $row['holding_pct'] ?? 0);
            $annualDemand = (float) ($row['annual_demand'] ?? $row['annual_usage'] ?? 0);
            $orderingCost = (float) ($row['ordering_cost'] ?? $row['order_cost'] ?? 0);
            $holdingCost = (float) ($row['holding_cost'] ?? $row['holding_pct'] ?? 0);

            $endingStock = $beginningStock + $received - $usageGross;
            $endingValue = $endingStock * $unitCost;
            $reorderPoint = ($dailyUsage * $leadTimeDays) + ($dailyUsage * $safetyStockFactor);
            $eoq = $annualDemand > 0 && $orderingCost > 0 && $holdingCost > 0
                ? sqrt((2 * $annualDemand * $orderingCost) / ($holdingCost * $unitCost))
                : 0;
            $status = $endingStock <= $reorderPoint ? 'REORDER' : 'OK';

            DB::table('raw_materials')->upsert([
                'material_name' => $materialName,
                'category' => (string) ($row['category'] ?? 'General'),
                'unit' => (string) ($row['unit'] ?? 'unit'),
                'unit_cost' => $unitCost,
                'beginning_stock' => $beginningStock,
                'received' => $received,
                'usage_gross' => $usageGross,
                'ending_stock' => $endingStock,
                'ending_value' => $endingValue,
                'daily_usage' => $dailyUsage,
                'annual_demand' => $annualDemand,
                'lead_time_days' => $leadTimeDays,
                'safety_stock_factor' => $safetyStockFactor,
                'reorder_point' => $reorderPoint,
                'holding_cost' => $holdingCost,
                'ordering_cost' => $orderingCost,
                'eoq' => $eoq,
                'status' => $status,
            ], ['material_name']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Raw materials saved.',
            'count' => count($rows),
        ]);
    }

    public function finishedGoods()
    {
        $rows = DB::table('finished_goods')
            ->select([
                'id',
                'sku',
                'product_name',
                'size',
                'unit_cost',
                'beginning_stock',
                'production',
                'sold',
                'ending_stock',
                'ending_value',
                'selling_price',
                'monthly_sales_rate',
                'lead_time',
                'buffer',
                'safety_stock',
                'reorder_point',
                'days_of_stock',
                'status',
            ])
            ->orderBy('product_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rows,
        ]);
    }

    public function storeFinishedGoods(Request $request)
    {
        $payload = $request->json()->all();
        $rows = $payload['rows'] ?? $payload;

        if (! is_array($rows) || $rows === []) {
            return response()->json([
                'success' => false,
                'message' => 'No payload provided.',
            ], 400);
        }

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $sku = trim((string) ($row['sku'] ?? ''));
            if ($sku === '') {
                continue;
            }

            $beginningStock = (float) ($row['beginning_stock'] ?? $row['beginning_pairs'] ?? 0);
            $production = (float) ($row['production'] ?? $row['produced'] ?? 0);
            $sold = (float) ($row['sold'] ?? 0);
            $endingStock = $beginningStock + $production - $sold;
            $status = $endingStock <= (float) ($row['safety_stock'] ?? 0) ? 'PRODUCE' : 'OK';

            DB::table('finished_goods')->upsert([
                'sku' => $sku,
                'product_name' => (string) ($row['product_name'] ?? $row['style'] ?? $sku),
                'size' => (string) ($row['size'] ?? 'N/A'),
                'unit_cost' => (float) ($row['unit_cost'] ?? 0),
                'beginning_stock' => $beginningStock,
                'production' => $production,
                'sold' => $sold,
                'ending_stock' => $endingStock,
                'ending_value' => (float) ($row['ending_value'] ?? 0),
                'selling_price' => (float) ($row['selling_price'] ?? 0),
                'monthly_sales_rate' => (float) ($row['monthly_sales_rate'] ?? $row['avg_daily_sales'] ?? 0),
                'lead_time' => (float) ($row['lead_time'] ?? $row['lead_time_days'] ?? 0),
                'buffer' => (float) ($row['buffer'] ?? $row['safety_stock_days'] ?? 0),
                'safety_stock' => (float) ($row['safety_stock'] ?? 0),
                'reorder_point' => (float) ($row['reorder_point'] ?? 0),
                'days_of_stock' => (float) ($row['days_of_stock'] ?? 0),
                'status' => $status,
            ], ['sku']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Finished goods saved.',
            'count' => count($rows),
        ]);
    }

    public function bomCosting()
    {
        $rows = DB::select(
            "SELECT
                p.id,
                p.sku,
                p.product_name,
                p.selling_price,
                p.direct_labor_cost,
                p.overhead_cost,
                p.waste_percentage,
                COALESCE(SUM(bi.quantity * rm.unit_cost), 0) AS direct_material_cost,
                COALESCE(SUM(bi.quantity * rm.unit_cost), 0) + p.direct_labor_cost + p.overhead_cost AS total_unit_cost,
                CASE
                    WHEN p.selling_price > 0 THEN ((p.selling_price - (COALESCE(SUM(bi.quantity * rm.unit_cost), 0) + p.direct_labor_cost + p.overhead_cost)) / p.selling_price) * 100
                    ELSE 0
                END AS gross_margin_pct,
                p.selling_price - (COALESCE(SUM(bi.quantity * rm.unit_cost), 0) + p.direct_labor_cost + p.overhead_cost) AS gross_profit
            FROM products p
            LEFT JOIN bom_items bi ON bi.product_id = p.id
            LEFT JOIN raw_materials rm ON rm.id = bi.raw_material_id
            GROUP BY p.id, p.sku, p.product_name, p.selling_price, p.direct_labor_cost, p.overhead_cost, p.waste_percentage
            ORDER BY p.product_name ASC"
        );

        return response()->json([
            'success' => true,
            'data' => $rows,
        ]);
    }

    public function storeBomCosting(Request $request)
    {
        $payload = $request->json()->all();
        $action = $payload['action'] ?? null;

        if ($action === 'delete') {
            $id = (int) ($payload['id'] ?? 0);

            if ($id <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No BOM item id provided.',
                ], 400);
            }

            DB::table('bom_items')->where('product_id', $id)->delete();
            DB::table('products')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'BOM item deleted.',
            ]);
        }

        if (! is_array($payload) || $payload === []) {
            return response()->json([
                'success' => false,
                'message' => 'No payload provided.',
            ], 400);
        }

        foreach ($payload as $row) {
            if (! is_array($row)) {
                continue;
            }

            $sku = trim((string) ($row['sku'] ?? $row['product_name'] ?? ''));
            $productName = trim((string) ($row['product_name'] ?? $row['style'] ?? $sku));

            if ($sku === '' || $productName === '') {
                continue;
            }

            $productId = DB::table('products')->upsert([
                'sku' => $sku,
                'product_name' => $productName,
                'selling_price' => (float) ($row['selling_price'] ?? 0),
                'direct_labor_cost' => (float) ($row['direct_labor_cost'] ?? 0),
                'overhead_cost' => (float) ($row['overhead_cost'] ?? 0),
                'waste_percentage' => (float) ($row['waste_percentage'] ?? 0),
            ], ['sku'], ['product_name', 'selling_price', 'direct_labor_cost', 'overhead_cost', 'waste_percentage']);

            $product = DB::table('products')->where('sku', $sku)->first();
            if ($product) {
                DB::table('bom_items')->where('product_id', $product->id)->delete();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'BOM costing saved.',
            'count' => count($payload),
        ]);
    }

    public function wip()
    {
        $rows = DB::table('work_in_progress as wip')
            ->join('products as p', 'p.id', '=', 'wip.product_id')
            ->select([
                'wip.id',
                'p.sku',
                'p.product_name',
                'wip.batch_name',
                'wip.quantity_in_process',
                'wip.direct_material_cost',
                'wip.direct_labor_cost',
                'wip.overhead_cost',
                'wip.status',
            ])
            ->orderBy('wip.batch_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rows,
        ]);
    }

    public function storeWip(Request $request)
    {
        $payload = $request->json()->all();
        $rows = $payload['rows'] ?? $payload;

        if (! is_array($rows) || $rows === []) {
            return response()->json([
                'success' => false,
                'message' => 'No payload provided.',
            ], 400);
        }

        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }

            $batchName = trim((string) ($row['batch_name'] ?? $row['stage'] ?? ''));
            $sku = trim((string) ($row['sku'] ?? ''));

            if ($batchName === '') {
                continue;
            }

            $product = $sku !== '' ? DB::table('products')->where('sku', $sku)->first() : null;
            $productId = $product ? $product->id : null;

            if ($productId === null && isset($row['product_id'])) {
                $productId = (int) $row['product_id'];
            }

            if ($productId === null) {
                continue;
            }

            DB::table('work_in_progress')->upsert([
                'product_id' => $productId,
                'batch_name' => $batchName,
                'quantity_in_process' => (float) ($row['quantity_in_process'] ?? $row['ending_pairs'] ?? 0),
                'direct_material_cost' => (float) ($row['direct_material_cost'] ?? 0),
                'direct_labor_cost' => (float) ($row['direct_labor_cost'] ?? 0),
                'overhead_cost' => (float) ($row['overhead_cost'] ?? 0),
                'status' => (string) ($row['status'] ?? 'OPEN'),
            ], ['product_id', 'batch_name']);
        }

        return response()->json([
            'success' => true,
            'message' => 'WIP saved.',
            'count' => count($rows),
        ]);
    }

    public function financialSummary()
    {
        $row = DB::selectOne(
            "SELECT
                ROUND(COALESCE(SUM(beginning_stock * unit_cost), 0), 2) AS beginning_finished_goods,
                ROUND(COALESCE(SUM(production * unit_cost), 0), 2) AS total_manufacturing_cost,
                ROUND(COALESCE(SUM(sold * unit_cost), 0), 2) AS cogs,
                ROUND(COALESCE(SUM(ending_stock * unit_cost), 0), 2) AS ending_finished_goods
            FROM finished_goods"
        );

        $beginningFinishedGoods = (float) ($row->beginning_finished_goods ?? 0);
        $totalManufacturingCost = (float) ($row->total_manufacturing_cost ?? 0);
        $cogs = (float) ($row->cogs ?? 0);
        $endingFinishedGoods = (float) ($row->ending_finished_goods ?? 0);

        return response()->json([
            'success' => true,
            'data' => [
                'beginning_finished_goods' => round($beginningFinishedGoods, 2),
                'total_manufacturing_cost' => round($totalManufacturingCost, 2),
                'cogm' => round(($beginningFinishedGoods + $totalManufacturingCost - $endingFinishedGoods), 2),
                'cogs' => round($cogs, 2),
                'ending_finished_goods' => round($endingFinishedGoods, 2),
            ],
        ]);
    }
}
