<?php

use App\Http\Controllers\InventoryApiController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Onies Inventory System Laravel API',
        'status' => 'ready',
        'routes' => [
            'GET /api/raw-materials',
            'POST /api/raw-materials',
            'GET /api/finished-goods',
            'POST /api/finished-goods',
            'GET /api/bom-costing',
            'POST /api/bom-costing',
            'GET /api/financials/cogm-cogs',
        ],
    ]);
});

Route::prefix('api')->group(function () {
    Route::get('/raw-materials', [InventoryApiController::class, 'rawMaterials']);
    Route::post('/raw-materials', [InventoryApiController::class, 'storeRawMaterials']);

    Route::get('/finished-goods', [InventoryApiController::class, 'finishedGoods']);
    Route::post('/finished-goods', [InventoryApiController::class, 'storeFinishedGoods']);

    Route::get('/bom-costing', [InventoryApiController::class, 'bomCosting']);
    Route::post('/bom-costing', [InventoryApiController::class, 'storeBomCosting']);

    Route::get('/financials/cogm-cogs', [InventoryApiController::class, 'financialSummary']);
    Route::get('/wip', [InventoryApiController::class, 'wip']);
    Route::post('/wip', [InventoryApiController::class, 'storeWip']);
});
