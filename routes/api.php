<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\CategoryRecognitionController;
use App\Http\Controllers\ExportController;
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::apiResource('goals', GoalController::class);
Route::post('/recognize-category', [CategoryRecognitionController::class, 'recognize']);
Route::get('/export/excel', [ExportController::class, 'exportExcel']);
Route::get('/export/pdf', [ExportController::class, 'exportPDF']);