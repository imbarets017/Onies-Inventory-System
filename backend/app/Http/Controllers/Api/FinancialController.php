<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class FinancialController extends Controller
{
    public function summary(): JsonResponse
    {
        $row = DB::table('finished_goods')->selectRaw('COALESCE(SUM(beginning_stock * unit_cost), 0) as beginning_finished_goods, COALESCE(SUM(production * unit_cost), 0) as total_manufacturing_cost, COALESCE(SUM(sold * unit_cost), 0) as cogs, COALESCE(SUM(ending_stock * unit_cost), 0) as ending_finished_goods')->first();
        $beginning = (float) $row->beginning_finished_goods;
        $manufacturing = (float) $row->total_manufacturing_cost;
        $ending = (float) $row->ending_finished_goods;

        return response()->json(['success' => true, 'data' => ['beginning_finished_goods' => round($beginning, 2), 'total_manufacturing_cost' => round($manufacturing, 2), 'cogm' => round($beginning + $manufacturing - $ending, 2), 'cogs' => round((float) $row->cogs, 2), 'ending_finished_goods' => round($ending, 2)]]);
    }
}
