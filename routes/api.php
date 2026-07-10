<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RefleksiQuestionController;
use App\Http\Controllers\Student\RefleksiAnswerController;
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

// Routes Tahap 5 - Refleksi Questions (Admin CRUD)
Route::get('refleksi-questions', [RefleksiQuestionController::class, 'index']);
Route::get('refleksi-questions/student', [RefleksiQuestionController::class, 'forStudent']);
Route::post('refleksi-questions', [RefleksiQuestionController::class, 'store']);
Route::put('refleksi-questions/{id}', [RefleksiQuestionController::class, 'update']);
Route::delete('refleksi-questions/{id}', [RefleksiQuestionController::class, 'destroy']);

// Student Refleksi Answer
Route::post('student/refleksi-answer', [RefleksiAnswerController::class, 'save']);
Route::post('login', [StudentAuthController::class, 'login']);
Route::post('admin/login', [AdminAuthController::class, 'login']);

// Routes Tahap 1 - News
Route::get('admin/news', [LearningNewsController::class, 'index']);
Route::post('admin/news', [LearningNewsController::class, 'store']);
Route::put('admin/news/{id}', [LearningNewsController::class, 'update']);
Route::delete('admin/news/{id}', [LearningNewsController::class, 'destroy']);
Route::post('admin/news/{news}/question', [NewsQuestionController::class, 'store']);
Route::delete('admin/question/{id}', [NewsQuestionController::class, 'destroy']);

// Routes Video
Route::get('video', [VideoController::class, 'show']);
Route::post('admin/video', [VideoController::class, 'save']);

// Routes Tahap 3 - Prep Questions (Student)
Route::get('preparation/questions', [PrepController::class, 'questions']);
Route::post('student/prep-answer', [PrepAnswerController::class, 'save']);

// Routes Tahap 3 - Prep Questions (Admin CRUD)
Route::get('admin/prep-questions', [\App\Http\Controllers\Admin\PrepQuestionController::class, 'index']);
Route::post('admin/prep-questions', [\App\Http\Controllers\Admin\PrepQuestionController::class, 'store']);
Route::put('admin/prep-questions/{id}', [\App\Http\Controllers\Admin\PrepQuestionController::class, 'update']);
Route::delete('admin/prep-questions/{id}', [\App\Http\Controllers\Admin\PrepQuestionController::class, 'destroy']);
Route::post('admin/prep-questions/bulk', [\App\Http\Controllers\Admin\PrepQuestionController::class, 'bulkStore']);

// Routes Tahap 1 - Student News Answers
Route::get('student/news/{id}/answer', [StudentNewsAnswerController::class, 'show']);
Route::post('student/news/{id}/answer', [StudentNewsAnswerController::class, 'save']);

// Routes Groups
Route::get('groups', [GroupController::class, 'index']);
Route::post('groups', [GroupController::class, 'store']);
Route::put('groups/{id}', [GroupController::class, 'update']);
Route::delete('groups/{id}', [GroupController::class, 'destroy']);
Route::get('students', [GroupController::class, 'students']);
Route::post('groups/assign', [GroupController::class, 'assign']);
Route::delete('groups/student/{id}', [GroupController::class, 'removeStudent']);
Route::post('heartbeat', [GroupController::class, 'heartbeat']);
Route::post('logout', [GroupController::class, 'logout']);
Route::get('me', [GroupController::class, 'me']);

// Routes Tahap 4 - Debate
Route::prefix('debate')->group(function () {
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
Route::prefix('reflection')->group(function () {
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
Route::get('admin/download/prep', [DownloadController::class, 'prepCsv']);
Route::get('admin/download/all', [DownloadController::class, 'allCsv']);
