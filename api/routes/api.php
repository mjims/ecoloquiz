<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailTemplateController;
use App\Http\Controllers\Api\EmailTypeController;
use App\Http\Controllers\Api\GiftController;
use App\Http\Controllers\Api\LevelController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\PlayerDashboardController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\ZoneController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/refresh', [AuthController::class, 'refresh']);
Route::post('auth/forgot-password', [PasswordController::class, 'forgot']);
Route::post('auth/reset-password', [PasswordController::class, 'reset']);

// Protected
Route::middleware('auth:api')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // User Management - Routes accessibles à tous les utilisateurs authentifiés
    Route::get('users/me', [\App\Http\Controllers\Api\UserManagementController::class, 'me']);
    Route::put('users/{id}', [\App\Http\Controllers\Api\UserManagementController::class, 'update']);
    Route::put('users/{id}/password', [\App\Http\Controllers\Api\UserManagementController::class, 'updatePassword']);
    Route::delete('users/{id}', [\App\Http\Controllers\Api\UserManagementController::class, 'destroy']);

    // User Management - Routes admin uniquement
    Route::put('users/{id}/disable', [\App\Http\Controllers\Api\UserManagementController::class, 'disable']);

    // Player Dashboard - Routes accessibles à tous les utilisateurs authentifiés
    Route::get('player/suggested-quiz', [PlayerDashboardController::class, 'suggestedQuiz']);
    Route::get('player/progression', [PlayerDashboardController::class, 'progression']);
    Route::get('player/current-game', [PlayerDashboardController::class, 'getCurrentGame']);
    Route::get('player/theme/{themeId}/next-question', [PlayerDashboardController::class, 'getNextQuestion']);
    Route::get('player/quiz/{id}/play', [PlayerDashboardController::class, 'getQuizToPlay']);
    Route::post('player/quiz/{quizId}/validate-answer', [PlayerDashboardController::class, 'validateAnswer']);
    Route::post('player/quiz/{id}/submit', [PlayerDashboardController::class, 'submitQuiz']);
});

// Admin-only user creation
Route::middleware(['auth:api', 'role:superadmin,partner_mayor,partner_sponsor'])->group(function () {
    // Admin Users routes
    Route::get('admin/users', [AdminUserController::class, 'index']);
    Route::get('admin/users/{id}', [AdminUserController::class, 'show']);
    Route::post('admin/users', [AdminUserController::class, 'store']);
    Route::put('admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('admin/users/{id}', [AdminUserController::class, 'destroy']);

    // Players routes
    Route::get('players', [PlayerController::class, 'index']);
    Route::get('players/{id}', [PlayerController::class, 'show']);

    // Levels routes
    Route::get('levels', [LevelController::class, 'index']);

    // Themes routes
    Route::get('themes', [ThemeController::class, 'index']);
    Route::get('themes/{id}', [ThemeController::class, 'show']);
    Route::post('themes', [ThemeController::class, 'store']);
    Route::put('themes/{id}', [ThemeController::class, 'update']);
    Route::delete('themes/{id}', [ThemeController::class, 'destroy']);

    // Quizzes routes
    Route::get('quizzes', [QuizController::class, 'index']);
    Route::get('quizzes/{id}', [QuizController::class, 'show']);
    Route::post('quizzes', [QuizController::class, 'store']);
    Route::put('quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('quizzes/{id}', [QuizController::class, 'destroy']);

    // Questions routes
    Route::get('questions', [QuestionController::class, 'index']);
    Route::get('questions/{id}', [QuestionController::class, 'show']);
    Route::post('questions', [QuestionController::class, 'store']);
    Route::put('questions/{id}', [QuestionController::class, 'update']);
    Route::delete('questions/{id}', [QuestionController::class, 'destroy']);

    // Upload routes
    Route::post('upload/image', [UploadController::class, 'uploadImage']);

    // Zones routes
    Route::get('zones', [ZoneController::class, 'index']);
    Route::get('zones/{id}', [ZoneController::class, 'show']);
    Route::post('zones', [ZoneController::class, 'store']);
    Route::put('zones/{id}', [ZoneController::class, 'update']);
    Route::delete('zones/{id}', [ZoneController::class, 'destroy']);

    // Regions routes
    Route::get('regions', [RegionController::class, 'index']);
    Route::get('regions/{id}', [RegionController::class, 'show']);

    // Email Templates routes
    Route::get('email-templates', [EmailTemplateController::class, 'index']);
    Route::get('email-templates/{id}', [EmailTemplateController::class, 'show']);
    Route::post('email-templates', [EmailTemplateController::class, 'store']);
    Route::put('email-templates/{id}', [EmailTemplateController::class, 'update']);
    Route::delete('email-templates/{id}', [EmailTemplateController::class, 'destroy']);

    // Email Types routes
    Route::get('email-types', [EmailTypeController::class, 'index']);
    Route::get('email-types/{id}', [EmailTypeController::class, 'show']);
    Route::post('email-types', [EmailTypeController::class, 'store']);
    Route::put('email-types/{id}', [EmailTypeController::class, 'update']);
    Route::delete('email-types/{id}', [EmailTypeController::class, 'destroy']);

    // Pages routes
    Route::get('pages', [PageController::class, 'index']);
    Route::get('pages/{id}', [PageController::class, 'show']);
    Route::post('pages', [PageController::class, 'store']);
    Route::put('pages/{id}', [PageController::class, 'update']);
    Route::delete('pages/{id}', [PageController::class, 'destroy']);

    // Gifts routes
    Route::get('gifts', [GiftController::class, 'index']);
    Route::get('gifts/{id}', [GiftController::class, 'show']);
    Route::post('gifts', [GiftController::class, 'store']);
    Route::put('gifts/{id}', [GiftController::class, 'update']);
    Route::delete('gifts/{id}', [GiftController::class, 'destroy']);

    // Statistics
    Route::get('stats', [StatsController::class, 'index']);
    Route::get('stats/filters', [StatsController::class, 'filters']);
});

// Permissions Management - Requires permissions.edit permission
Route::middleware(['auth:api', 'permission:permissions.view,permissions.edit'])->group(function () {
    Route::get('permissions', [PermissionController::class, 'index']);
    Route::get('permissions/{permission}', [PermissionController::class, 'show']);
});

Route::middleware(['auth:api', 'permission:permissions.create'])->group(function () {
    Route::post('permissions', [PermissionController::class, 'store']);
});

Route::middleware(['auth:api', 'permission:permissions.edit'])->group(function () {
    Route::put('permissions/{permission}', [PermissionController::class, 'update']);
});

Route::middleware(['auth:api', 'permission:permissions.delete'])->group(function () {
    Route::delete('permissions/{permission}', [PermissionController::class, 'destroy']);
});

// Roles Management - Requires roles.edit permission
Route::middleware(['auth:api', 'permission:roles.view,roles.edit'])->group(function () {
    Route::get('roles', [RoleController::class, 'index']);
    Route::get('roles/{role}', [RoleController::class, 'show']);
});

Route::middleware(['auth:api', 'permission:roles.create'])->group(function () {
    Route::post('roles', [RoleController::class, 'store']);
});

Route::middleware(['auth:api', 'permission:roles.edit'])->group(function () {
    Route::put('roles/{role}', [RoleController::class, 'update']);
});

Route::middleware(['auth:api', 'permission:roles.delete'])->group(function () {
    Route::delete('roles/{role}', [RoleController::class, 'destroy']);
});
