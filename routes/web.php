<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\StudentAuthController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Admin\LearningNewsController;
use App\Http\Controllers\Admin\NewsQuestionController;
use App\Http\Controllers\Admin\VideoController;
use App\Http\Controllers\Student\PrepController;
use App\Http\Controllers\Student\PrepAnswerController;
use App\Http\Controllers\Student\DebateController;
use App\Http\Controllers\Student\ReflectionController;
use App\Http\Controllers\Student\StudentNewsAnswerController;
use App\Http\Controllers\Admin\GroupController;
use App\Http\Controllers\Admin\DownloadController;
use App\Http\Controllers\Admin\LearningObjectiveController;

Route::get('/', [StudentAuthController::class, 'showLogin'])->name('login');
Route::post('/login', [StudentAuthController::class, 'login']);

// Route /admin GET - arahkan ke halaman utama (login admin via tombol di halaman utama)
Route::get('/admin', fn() => redirect('/'));
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Routes Tujuan Pembelajaran
Route::get('/api/learning-objectives', [LearningObjectiveController::class, 'index']);
Route::post('/api/admin/learning-objectives', [LearningObjectiveController::class, 'store']);
Route::put('/api/admin/learning-objectives/{id}', [LearningObjectiveController::class, 'update']);
Route::delete('/api/admin/learning-objectives/{id}', [LearningObjectiveController::class, 'destroy']);

// Routes Tahap 1 - News
Route::get('/admin/news', [LearningNewsController::class, 'index']);
Route::post('/admin/news', [LearningNewsController::class, 'store']);
Route::put('/admin/news/{id}', [LearningNewsController::class, 'update']);
Route::delete('/admin/news/{id}', [LearningNewsController::class, 'destroy']);
Route::post('/admin/news/{news}/question', [NewsQuestionController::class, 'store']);
Route::delete('/admin/question/{id}', [NewsQuestionController::class, 'destroy']);

// Routes Video
Route::get('/video', [VideoController::class, 'show']);
Route::post('/admin/video', [VideoController::class, 'save']);

// Routes Tahap 3 - Prep Questions
Route::get('/api/preparation/questions', [PrepController::class, 'questions']);
Route::post('/student/prep-answer', [PrepAnswerController::class, 'save']);

// Routes Tahap 1 - Student News Answers
Route::get('/student/news/{id}/answer', [StudentNewsAnswerController::class, 'show']);
Route::post('/student/news/{id}/answer', [StudentNewsAnswerController::class, 'save']);

// Routes Groups
Route::get('/api/groups', [GroupController::class, 'index']);
Route::post('/api/groups', [GroupController::class, 'store']);
Route::put('/api/groups/{id}', [GroupController::class, 'update']);
Route::delete('/api/groups/{id}', [GroupController::class, 'destroy']);
Route::get('/api/students', [GroupController::class, 'students']);
Route::post('/api/groups/assign', [GroupController::class, 'assign']);
Route::delete('/api/groups/student/{id}', [GroupController::class, 'removeStudent']);
Route::post('/api/heartbeat', [GroupController::class, 'heartbeat']);
Route::post('/api/logout', [GroupController::class, 'logout']);
Route::get('/api/me', [GroupController::class, 'me']);

// Routes Tahap 4 - Debate
Route::prefix('api/debate')->group(function () {
    // Public/Student routes
    Route::get('/session', [DebateController::class, 'currentSession']);
    Route::get('/arguments', [DebateController::class, 'getArguments']);
    Route::get('/kancing', [DebateController::class, 'getKancingStatus']);
    Route::post('/argument', [DebateController::class, 'submitArgument']);

    // Admin routes
    Route::get('/groups', [DebateController::class, 'availableGroups']);
    Route::get('/sessions', [DebateController::class, 'allSessions']);
    Route::post('/session', [DebateController::class, 'createSession']);
    Route::post('/session/{id}/start', [DebateController::class, 'startSession']);
    Route::post('/session/{id}/finish', [DebateController::class, 'finishSession']);
    Route::put('/session/{id}/groups', [DebateController::class, 'setGroups']);
    Route::post('/kancing/{groupId}/reduce', [DebateController::class, 'reduceKancing']);
    Route::post('/kancing/{groupId}/reset', [DebateController::class, 'resetKancing']);
});

// Routes Tahap 5 - Reflection/Q&A
Route::prefix('api/reflection')->group(function () {
    // Student routes
    Route::get('/', [ReflectionController::class, 'index']);
    Route::post('/', [ReflectionController::class, 'store']);
    Route::delete('/{id}', [ReflectionController::class, 'destroy']);

    // Admin routes
    Route::get('/unanswered', [ReflectionController::class, 'unanswered']);
    Route::get('/counts', [ReflectionController::class, 'counts']);
    Route::post('/{id}/answer', [ReflectionController::class, 'answer']);
});

// Admin Download
Route::get('/admin/download/prep', [DownloadController::class, 'prepCsv']);
