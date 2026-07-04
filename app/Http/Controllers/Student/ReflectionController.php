<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Reflection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReflectionController extends Controller
{
    /**
     * Get all reflections
     * Admin sees all, students see only their own
     */
    public function index(Request $request)
    {
        // Clear any cached session - force read from actual session
        $studentId = $request->query('student_id') ?? session()->get('student_id');
        $adminId = $request->query('admin_id') ?? session()->get('admin_id');
        $isAdmin = $adminId !== null || $request->query('is_admin') === 'true' || $request->query('is_admin') === true;

        // Log for debugging
        Log::info('Reflection API called', [
            'student_id_session' => $studentId,
            'admin_id_session' => $adminId,
            'is_admin' => $isAdmin,
            'ip' => request()->ip()
        ]);

        // If not logged in, return empty
        if (!$studentId && !$isAdmin) {
            return response()->json([
                'success' => true,
                'data' => [],
                'debug' => 'Not authenticated'
            ]);
        }

        if ($isAdmin) {
            // Admin sees all reflections with user info
            $reflections = Reflection::with(['user', 'answeredByUser'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($r) => $this->formatReflection($r, true));
        } else {
            // Student sees ONLY their own reflections - SECURITY CRITICAL
            $reflections = Reflection::where('user_id', $studentId)
                ->with(['answeredByUser'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($r) => $this->formatReflection($r, false));

            Log::info('Student reflections returned', [
                'student_id' => $studentId,
                'count' => $reflections->count(),
                'reflections' => $reflections->pluck('id')->toArray()
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $reflections
        ]);
    }

    /**
     * Get unanswered reflections (admin only)
     */
    public function unanswered()
    {
        if (session()->get('admin_id') === null) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $reflections = Reflection::with('user')
            ->whereNull('answer')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($r) => $this->formatReflection($r, true));

        return response()->json([
            'success' => true,
            'data' => $reflections
        ]);
    }

    /**
     * Get counts (admin only)
     */
    public function counts()
    {
        if (session()->get('admin_id') === null) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $total = Reflection::count();
        $answered = Reflection::whereNotNull('answer')->count();
        $unanswered = Reflection::whereNull('answer')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'answered' => $answered,
                'unanswered' => $unanswered
            ]
        ]);
    }

    /**
     * Submit a new reflection question (student)
     */
    public function store(Request $request)
    {
        $studentId = $request->input('student_id') ?? session()->get('student_id');
        if (!$studentId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Please login again'
            ], 401);
        }

        $request->validate([
            'question' => 'required|string|max:2000'
        ]);

        $reflection = Reflection::create([
            'user_id' => $studentId,
            'question' => $request->question
        ]);

        Log::info('New reflection created', [
            'reflection_id' => $reflection->id,
            'user_id' => $studentId
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatReflection($reflection->load('user'), false)
        ]);
    }

    /**
     * Answer a reflection question (admin)
     */
    public function answer(Request $request, $id)
    {
        if (session()->get('admin_id') === null) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $request->validate([
            'answer' => 'required|string|max:5000'
        ]);

        $reflection = Reflection::findOrFail($id);
        $adminId = session()->get('admin_id');

        $reflection->update([
            'answer' => $request->answer,
            'answered_by' => $adminId,
            'answered_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatReflection($reflection->fresh(['user', 'answeredByUser']), true)
        ]);
    }

    /**
     * Delete a reflection (owner or admin)
     */
    public function destroy(Request $request, $id)
    {
        $reflection = Reflection::findOrFail($id);
        $studentId = $request->input('student_id') ?? $request->query('student_id') ?? session()->get('student_id');
        $adminId = $request->input('admin_id') ?? $request->query('admin_id') ?? session()->get('admin_id');
        $isAdmin = $adminId !== null || $request->input('is_admin') === 'true' || $request->input('is_admin') === true || $request->query('is_admin') === 'true' || $request->query('is_admin') === true;

        // Allow deletion if user owns it or is admin
        if ($reflection->user_id != $studentId && !$isAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $reflection->delete();

        return response()->json([
            'success' => true
        ]);
    }

    /**
     * Format reflection for response
     */
    private function formatReflection(Reflection $reflection, bool $includeUserDetails): array
    {
        $data = [
            'id' => $reflection->id,
            'question' => $reflection->question,
            'answer' => $reflection->answer,
            'created_at' => $reflection->created_at->toISOString(),
            'time' => $reflection->created_at->format('H:i'),
            'date' => $reflection->created_at->format('d M Y'),
            'is_answered' => $reflection->isAnswered()
        ];

        if ($reflection->user) {
            $data['user'] = [
                'id' => $reflection->user->id,
                'name' => $reflection->user->name,
                'school' => $reflection->user->school,
                'initial' => substr($reflection->user->name, 0, 1)
            ];
        }

        if ($reflection->answered_at) {
            $data['answered_at'] = $reflection->answered_at->toISOString();
            $data['answered_time'] = $reflection->answered_at->format('H:i');
        }

        if ($reflection->answeredByUser) {
            $data['answered_by'] = [
                'id' => $reflection->answeredByUser->id,
                'name' => $reflection->answeredByUser->name
            ];
        }

        if ($includeUserDetails) {
            $data['is_own'] = $reflection->user_id == (request('student_id') ?? session()->get('student_id'));
        }

        return $data;
    }
}
