<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FinancialController;
use App\Http\Controllers\Api\FinishedGoodController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RawMaterialController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkInProgressController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['name' => 'Onies Inventory System Laravel API', 'status' => 'ready']));

Route::prefix('api')->group(function (): void {
    Route::get('/auth/csrf', [AuthController::class, 'csrf']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/raw-materials', [RawMaterialController::class, 'index']);
        Route::get('/finished-goods', [FinishedGoodController::class, 'index']);
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/bom-costing', [ProductController::class, 'bomIndex']);
        Route::get('/wip', [WorkInProgressController::class, 'index']);
        Route::get('/financials/cogm-cogs', [FinancialController::class, 'summary']);

        Route::middleware('role:admin,manager')->group(function (): void {
            Route::post('/raw-materials', [RawMaterialController::class, 'store']);
            Route::put('/raw-materials/{rawMaterial}', [RawMaterialController::class, 'update']);
            Route::patch('/raw-materials/{rawMaterial}', [RawMaterialController::class, 'update']);
            Route::post('/finished-goods', [FinishedGoodController::class, 'store']);
            Route::put('/finished-goods/{finishedGood}', [FinishedGoodController::class, 'update']);
            Route::patch('/finished-goods/{finishedGood}', [FinishedGoodController::class, 'update']);
            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{product}', [ProductController::class, 'update']);
            Route::patch('/products/{product}', [ProductController::class, 'update']);
            Route::post('/wip', [WorkInProgressController::class, 'store']);
            Route::put('/wip/{workInProgress}', [WorkInProgressController::class, 'update']);
            Route::patch('/wip/{workInProgress}', [WorkInProgressController::class, 'update']);
        });

        Route::middleware('role:admin,manager')->group(function (): void {
            Route::delete('/raw-materials/{rawMaterial}', [RawMaterialController::class, 'destroy']);
            Route::delete('/finished-goods/{finishedGood}', [FinishedGoodController::class, 'destroy']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);
            Route::delete('/wip/{workInProgress}', [WorkInProgressController::class, 'destroy']);
        });

        Route::middleware('role:admin')->group(function (): void {
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::patch('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });
    });
});
