<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\DebateSession;
use App\Models\DebateGroup;
use App\Models\DebateArgument;
use App\Models\DebateKancingLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebateController extends Controller
{
    /**
     * Get current or latest debate session
     */
    public function currentSession()
    {
        $session = DebateSession::with(['proGroup.members', 'conGroup.members'])
            ->latest()
            ->first();

        if (!$session) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Tidak ada sesi debat aktif'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatSession($session)
        ]);
    }

    /**
     * Get all available groups for admin to select
     */
    public function availableGroups()
    {
        $groups = DebateGroup::with('members')->get();
        return response()->json([
            'success' => true,
            'data' => $groups
        ]);
    }

    /**
     * Create or update debate session (admin only) - supports 3 groups
     */
    public function createSession(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:500',
            'pro_group_id' => 'nullable|exists:debate_groups,id',
            'con_group_id' => 'nullable|exists:debate_groups,id',
            'third_group_id' => 'nullable|exists:debate_groups,id'
        ]);

        // End any active sessions first
        DebateSession::where('status', 'active')->update(['status' => 'finished']);

        // Count number of groups
        $groupCount = 0;
        if ($request->pro_group_id) $groupCount++;
        if ($request->con_group_id) $groupCount++;
        if ($request->third_group_id) $groupCount++;

        // Create new session first so we have an ID
        $session = DebateSession::create([
            'topic' => $request->topic,
            'status' => 'waiting',
            'pro_group_id' => $request->pro_group_id,
            'con_group_id' => $request->con_group_id,
            'third_group_id' => $request->third_group_id
        ]);

        // Reset kancing for all selected groups using the session ID
        if ($request->pro_group_id) {
            DebateGroup::find($request->pro_group_id)?->resetKancing($session->id, $groupCount);
        }
        if ($request->con_group_id) {
            DebateGroup::find($request->con_group_id)?->resetKancing($session->id, $groupCount);
        }
        if ($request->third_group_id) {
            DebateGroup::find($request->third_group_id)?->resetKancing($session->id, $groupCount);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatSession($session->fresh(['proGroup.members', 'conGroup.members', 'thirdGroup.members']))
        ]);
    }

    /**
     * Start debate session (admin only)
     */
    public function startSession($sessionId)
    {
        $session = DebateSession::findOrFail($sessionId);

        if ($session->status === 'finished') {
            return response()->json([
                'success' => false,
                'message' => 'Sesi debat sudah selesai'
            ], 400);
        }

        $session->status = 'active';
        $session->save();

        return response()->json([
            'success' => true,
            'data' => $this->formatSession($session->fresh(['proGroup.members', 'conGroup.members']))
        ]);
    }

    /**
     * Finish debate session (admin only)
     */
    public function finishSession($sessionId)
    {
        $session = DebateSession::findOrFail($sessionId);
        $session->status = 'finished';
        $session->save();

        return response()->json([
            'success' => true,
            'data' => $this->formatSession($session)
        ]);
    }

    /**
     * Set debate groups for a session (admin only) - supports 3 groups
     */
    public function setGroups(Request $request, $sessionId)
    {
        $request->validate([
            'pro_group_id' => 'nullable|exists:debate_groups,id',
            'con_group_id' => 'nullable|exists:debate_groups,id',
            'third_group_id' => 'nullable|exists:debate_groups,id'
        ]);

        $session = DebateSession::findOrFail($sessionId);

        if ($session->status === 'finished') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah grup pada sesi yang sudah selesai'
            ], 400);
        }

        $session->pro_group_id = $request->pro_group_id;
        $session->con_group_id = $request->con_group_id;
        $session->third_group_id = $request->third_group_id;
        $session->save();

        // Count number of groups set
        $groupCount = 0;
        if ($request->pro_group_id) $groupCount++;
        if ($request->con_group_id) $groupCount++;
        if ($request->third_group_id) $groupCount++;

        // Reset kancing for the new groups (kancing = number of groups)
        if ($request->pro_group_id) {
            DebateGroup::find($request->pro_group_id)?->resetKancing($session->id, $groupCount);
        }
        if ($request->con_group_id) {
            DebateGroup::find($request->con_group_id)?->resetKancing($session->id, $groupCount);
        }
        if ($request->third_group_id) {
            DebateGroup::find($request->third_group_id)?->resetKancing($session->id, $groupCount);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatSession($session->fresh(['proGroup.members', 'conGroup.members', 'thirdGroup.members']))
        ]);
    }

    /**
     * Submit an argument (student)
     */
    public function submitArgument(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:2000'
        ]);

        $studentId = $request->input('student_id') ?? session('student_id');
        if (!$studentId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Get active session
        $session = DebateSession::where('status', 'active')->latest()->first();
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada sesi debat aktif'
            ], 400);
        }

        // Get student's group membership
        $member = DB::table('group_members')
            ->where('student_id', $studentId)
            ->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu belum menjadi anggota kelompok debat manapun'
            ], 400);
        }

        $group = DebateGroup::find($member->debate_group_id);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Kelompok debat tidak ditemukan'
            ], 400);
        }

        // Check if this group is participating in the current session
        $isPro = $session->pro_group_id === $group->id;
        $isCon = $session->con_group_id === $group->id;

        if (!$isPro && !$isCon) {
            return response()->json([
                'success' => false,
                'message' => 'Kelompokmu tidak участвует dalam debat ini'
            ], 400);
        }

        // Check if group still has kancing
        if ($group->kancing_count <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kancing tim sudah habis!'
            ], 400);
        }

        $side = $isPro ? 'pro' : 'con';

        // Create argument
        $argument = DebateArgument::create([
            'debate_session_id' => $session->id,
            'user_id' => $studentId,
            'debate_group_id' => $group->id,
            'content' => $request->content,
            'side' => $side
        ]);

        // Reduce kancing
        $group->reduceKancing(
            \App\Models\User::find($studentId),
            'argument_submitted',
            $session->id
        );

        return response()->json([
            'success' => true,
            'data' => [
                'argument' => [
                    'id' => $argument->id,
                    'content' => $argument->content,
                    'side' => $argument->side,
                    'user' => [
                        'id' => $argument->user->id,
                        'name' => $argument->user->name
                    ],
                    'created_at' => $argument->created_at->toISOString()
                ],
                'kancing_status' => $this->formatKancingStatus($session)
            ]
        ]);
    }

    /**
     * Reduce kancing for a group (admin)
     */
    public function reduceKancing(Request $request, $groupId)
    {
        $request->validate([
            'reason' => 'nullable|string|max:200'
        ]);

        $group = DebateGroup::findOrFail($groupId);
        $sessionId = DebateSession::whereIn('status', ['active', 'waiting'])->latest()->first()?->id 
            ?? DebateSession::latest()->first()?->id;

        if (!$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada sesi debat yang terdaftar!'
            ], 400);
        }

        $success = $group->reduceKancing(
            null,
            $request->reason ?? 'manual_reduction',
            $sessionId
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Kancing sudah habis!'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'group_id' => $group->id,
                'kancing_count' => $group->kancing_count,
                'kancing_status' => $this->getKancingStatus()
            ]
        ]);
    }

    /**
     * Reset kancing for a group (admin)
     */
    public function resetKancing($groupId)
    {
        $group = DebateGroup::findOrFail($groupId);
        $sessionId = DebateSession::whereIn('status', ['active', 'waiting'])->latest()->first()?->id 
            ?? DebateSession::latest()->first()?->id;

        if (!$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada sesi debat yang terdaftar!'
            ], 400);
        }

        $group->resetKancing($sessionId);

        return response()->json([
            'success' => true,
            'data' => [
                'group_id' => $group->id,
                'kancing_count' => $group->kancing_count,
                'kancing_status' => $this->getKancingStatus()
            ]
        ]);
    }

    /**
     * Get all arguments for current session
     */
    public function getArguments()
    {
        $session = DebateSession::whereIn('status', ['active', 'finished'])
            ->latest()
            ->first();

        if (!$session) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $arguments = DebateArgument::with('user')
            ->where('debate_session_id', $session->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'content' => $a->content,
                'side' => $a->side,
                'user' => [
                    'id' => $a->user->id,
                    'name' => $a->user->name
                ],
                'created_at' => $a->created_at->toISOString(),
                'time' => $a->created_at->format('H:i')
            ]);

        return response()->json([
            'success' => true,
            'data' => $arguments
        ]);
    }

    /**
     * Get current kancing status
     */
    public function getKancingStatus()
    {
        $session = DebateSession::whereIn('status', ['active', 'waiting'])
            ->latest()
            ->first();

        if (!$session) {
            return response()->json([
                'success' => true,
                'data' => [
                    'pro' => 5,
                    'con' => 5
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatKancingStatus($session)
        ]);
    }

    /**
     * Get all sessions (admin)
     */
    public function allSessions()
    {
        $sessions = DebateSession::with(['proGroup', 'conGroup'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => $this->formatSession($s));

        return response()->json([
            'success' => true,
            'data' => $sessions
        ]);
    }

    /**
     * Helper: Format session data (supports 3 groups)
     */
    private function formatSession(DebateSession $session): array
    {
        return [
            'id' => $session->id,
            'topic' => $session->topic,
            'status' => $session->status,
            'created_at' => $session->created_at->toISOString(),
            'pro_group' => $session->proGroup ? [
                'id' => $session->proGroup->id,
                'name' => $session->proGroup->name,
                'icon' => $session->proGroup->icon,
                'kancing_count' => $session->proGroup->kancing_count,
                'members' => $session->proGroup->members->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->name
                ])
            ] : null,
            'con_group' => $session->conGroup ? [
                'id' => $session->conGroup->id,
                'name' => $session->conGroup->name,
                'icon' => $session->conGroup->icon,
                'kancing_count' => $session->conGroup->kancing_count,
                'members' => $session->conGroup->members->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->name
                ])
            ] : null,
            'third_group' => $session->thirdGroup ? [
                'id' => $session->thirdGroup->id,
                'name' => $session->thirdGroup->name,
                'icon' => $session->thirdGroup->icon,
                'kancing_count' => $session->thirdGroup->kancing_count,
                'members' => $session->thirdGroup->members->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->name
                ])
            ] : null,
            'kancing_status' => $this->formatKancingStatus($session)
        ];
    }

    /**
     * Helper: Format kancing status (supports 3 groups)
     */
    private function formatKancingStatus(DebateSession $session): array
    {
        $status = [];
        if ($session->proGroup) {
            $status['pro'] = $session->proGroup->kancing_count;
        }
        if ($session->conGroup) {
            $status['con'] = $session->conGroup->kancing_count;
        }
        if ($session->thirdGroup) {
            $status['netral'] = $session->thirdGroup->kancing_count;
        }
        return $status;
    }
}
