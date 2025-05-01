<?php

use App\Http\Controllers\EmailController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get("/sendemail", [EmailController::class, "send_email"]);
// Route::post('/register', [AuthController::class, 'register']);
