<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AutomationRuleController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\CategoryRecognitionController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\UserPreferenceController;

use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TelegramWebhookController;

Route::post('/telegram/webhook/{secret}', [TelegramWebhookController::class, 'handle'])
    ->name('telegram.webhook');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();

    });


    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::post('/user/telegram/link', [UserPreferenceController::class, 'generateTelegramLink']);

    Route::apiResource('automation-rules', AutomationRuleController::class);

    // Transactions CRUD
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);

    // Categories CRUD
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::post('/categories/recognize', [CategoryRecognitionController::class, 'recognize']);
    Route::post('/recognize-category', [CategoryRecognitionController::class, 'recognize']);

    // Groups CRUD
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::put('/groups/{id}', [GroupController::class, 'update']);
    Route::delete('/groups/{id}', [GroupController::class, 'destroy']);

    //Goals
    Route::get('/goals', [GoalController::class, 'index']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::put('/goals/{id}', [GoalController::class, 'update']);
    Route::delete('/goals/{id}', [GoalController::class, 'destroy']);

    //export/prefs
    Route::get('/export/excel', [ExportController::class, 'exportExcel']);
    Route::get('/export/pdf', [ExportController::class, 'exportPDF']);
    Route::get('/user/preferences', [UserPreferenceController::class, 'show']);
    Route::put('/user/preferences', [UserPreferenceController::class, 'update']);

    //AUTOMATION
    Route::get('/automation-rules', [AutomationRuleController::class, 'index']);
    Route::post('/automation-rules', [AutomationRuleController::class, 'store']);
    Route::put('/automation-rules/{automationRule}', [AutomationRuleController::class, 'update']);
    Route::delete('/automation-rules/{automationRule}', [AutomationRuleController::class, 'destroy']);

});
