<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\TaskController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// Protected route
Route::get('/user', function (Request $request) {
    return $request->get('authenticated_user');
})->middleware('check.user');

Route::post('/tasks/{user_id}', [TaskController::class, 'addTask']);
Route::put('/tasks/update/{task_id}', [TaskController::class, 'updateTask']);
Route::get('/tasks/created-today/{user_id}', [TaskController::class, 'getCreatedTodayTasks']);
Route::get('/tasks/due-today/{user_id}', [TaskController::class, 'getDueTodayTasks']);
Route::get('/tasks/pending/{user_id}', [TaskController::class, 'getPendingTasks']);
Route::get('/tasks/overdue/{user_id}', [TaskController::class, 'getOverdueTasks']);
Route::delete('/tasks/remove-task/{task_id}', [TaskController::class, 'removeTask']);
Route::get('/tasks/completed/{user_id}', [TaskController::class, 'getCompletedTasks']);
Route::get('/tasks/reminders/upcoming/{user_id}', [TaskController::class, 'getUpcomingReminders']);
Route::get('/tasks/reminders/past/{user_id}', [TaskController::class, 'getPastReminders']);
Route::get('/stats/{user_id}', [StatsController::class, 'getUserStats']);
