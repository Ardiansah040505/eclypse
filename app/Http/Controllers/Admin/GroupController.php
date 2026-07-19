<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    public function index()
    {
        $groups = DB::table('debate_groups')->get();
        foreach ($groups as $g) {
            $g->members = DB::table('group_members as gm')
                ->join('users as u', 'gm.student_id', 'u.id')
                ->where('gm.debate_group_id', $g->id)
                ->select('u.id', 'u.name', 'u.nis')
                ->get();
        }
        return response()->json(['success' => true, 'data' => $groups]);
    }

    public function store(\Illuminate\Http\Request $r)
    {
        $r->validate(['name' => 'required']);
        $side = strtolower($r->side) === 'kontra' || strtolower($r->side) === 'con' ? 'con' : 'pro';
        $icons = ['🌿','⚡','🌊','🔥','🌪️','🌱'];
        $icon = $r->icon ?? $icons[array_rand($icons)];
        $memberCount = $r->member_count ?? 0;

        $id = DB::table('debate_groups')->insertGetId([
            'name' => $r->name,
            'side' => $side,
            'icon' => $icon,
            'member_count' => $memberCount,
            'created_at' => now(), 'updated_at' => now()
        ]);
        return response()->json(['success' => true, 'id' => $id]);
    }

    public function update(\Illuminate\Http\Request $r, $id)
    {
        $r->validate(['name' => 'required']);
        $side = strtolower($r->side) === 'kontra' || strtolower($r->side) === 'con' ? 'con' : 'pro';
        $icon = $r->icon ?? '👥';

        DB::table('debate_groups')
            ->where('id', $id)
            ->update([
                'name' => $r->name,
                'side' => $side,
                'icon' => $icon,
                'updated_at' => now()
            ]);

        return response()->json(['success' => true, 'message' => 'Kelompok berhasil diperbarui']);
    }

    public function students()
    {
        // Get all students who are in any group (for reference)
        $groupedStudentIds = DB::table('group_members')
            ->distinct()
            ->pluck('student_id')
            ->toArray();

        $students = \App\Models\User::where('role', 'student')
            ->select('id', 'name', 'nis', 'school as sekolah', 'last_seen')
            ->get()
            ->map(function ($s) use ($groupedStudentIds) {
                $isInGroup = in_array($s->id, $groupedStudentIds);

                // Check if last_seen is a valid timestamp and within 60 seconds
                $lastSeen = $s->last_seen;
                $isOnline = false;
                if ($lastSeen) {
                    try {
                        // Gunakan diffInSeconds langsung untuk perbandingan yang lebih akurat
                        $lastSeenTime = \Carbon\Carbon::parse($lastSeen);
                        $now = now();
                        $diffSeconds = abs($lastSeenTime->diffInSeconds($now));
                        // User is online if last_seen is within the last 60 seconds
                        $isOnline = $diffSeconds <= 60;
                    } catch (\Exception $e) {
                        $isOnline = false;
                    }
                }
                $s->is_online = $isOnline;
                $s->is_in_group = $isInGroup;
                return $s;
            });

        return response()->json(['success' => true, 'data' => $students]);
    }

    public function assign(\Illuminate\Http\Request $r)
    {
        $r->validate(['student_id' => 'required', 'debate_group_id' => 'required']);
        DB::table('group_members')->updateOrInsert(
            ['student_id' => $r->student_id],
            ['debate_group_id' => $r->debate_group_id, 'updated_at' => now()]
        );
        return response()->json(['success' => true]);
    }

    public function removeStudent($studentId)
    {
        DB::table('group_members')->where('student_id', $studentId)->delete();
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        // Delete all group members first
        DB::table('group_members')->where('debate_group_id', $id)->delete();

        // Delete the group
        DB::table('debate_groups')->where('id', $id)->delete();

        return response()->json(['success' => true, 'message' => 'Kelompok berhasil dihapus']);
    }

    public function heartbeat(\Illuminate\Http\Request $r)
    {
        $studentId = $r->input('student_id') ?? session('student_id');
        if (!$studentId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Update last_seen dengan timestamp sekarang
        \App\Models\User::where('id', $studentId)->update(['last_seen' => now()]);

        // Get group info only if needed (when viewing tahap3)
        $group = null;
        $includeGroup = $r->boolean('include_group', false);

        if ($includeGroup) {
            $member = DB::table('group_members')
                ->where('student_id', $studentId)
                ->first();

            if ($member) {
                $group = DB::table('debate_groups')
                    ->where('id', $member->debate_group_id)
                    ->first();

                if ($group) {
                    $group->members = DB::table('group_members as gm')
                        ->join('users as u', 'gm.student_id', 'u.id')
                        ->where('gm.debate_group_id', $group->id)
                        ->select('u.id', 'u.name', 'u.nis', 'u.school as sekolah')
                        ->get();
                }
            }
        }

        return response()->json([
            'success' => true,
            'group' => $group
        ]);
    }

    /**
     * Logout - Mark user as offline
     */
    public function logout(\Illuminate\Http\Request $r)
    {
        $studentId = $r->input('student_id') ?? session('student_id');
        if ($studentId) {
            // Mark user as offline by setting last_seen to null
            \App\Models\User::where('id', $studentId)->update(['last_seen' => null]);
        }

        // Clear session
        session()->flush();

        return response()->json(['success' => true]);
    }

    /**
     * Get current logged-in user from token (for page refresh restore)
     */
    public function me(\Illuminate\Http\Request $request)
    {
        $token = $request->query('token') ?? $request->header('X-Token');

        if ($token) {
            $user = User::where('api_token', $token)->first();
            if ($user) {
                return response()->json([
                    'success'  => true,
                    'user'     => $user,
                    'is_admin' => $user->role === 'admin',
                ]);
            }
        }

        return response()->json(['success' => false]);
    }

    /**
     * Assign student to group from spin wheel
     */
    public function assignSpin(\Illuminate\Http\Request $r)
    {
        $r->validate([
            'student_id' => 'required',
            'group_id' => 'required'
        ]);

        // Check if student already in a group from spin
        $existing = DB::table('spin_group_assignments')
            ->where('student_id', $r->student_id)
            ->first();

        if ($existing) {
            // Update
            DB::table('spin_group_assignments')
                ->where('student_id', $r->student_id)
                ->update([
                    'group_id' => $r->group_id,
                    'group_name' => $r->group_name,
                    'updated_at' => now()
                ]);
        } else {
            // Insert
            DB::table('spin_group_assignments')->insert([
                'student_id' => $r->student_id,
                'group_id' => $r->group_id,
                'group_name' => $r->group_name,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kelompok berhasil disimpan!'
        ]);
    }

    /**
     * Auto-balance students across 3 debate teams based on eco_role
     * Distributes researchers, activists, and merchants evenly
     */
    public function autoBalance(\Illuminate\Http\Request $r)
    {
        // Get all students with their eco_role
        $students = DB::table('users')
            ->where('role', 'student')
            ->whereNotNull('eco_role')
            ->get();

        if ($students->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada siswa dengan eco_role. Siswa perlu memilih eco card di Tahap 2 dulu.'
            ], 400);
        }

        // Group students by eco_role
        $byRole = [
            'peneliti' => [],
            'aktivis' => [],
            'pedagang' => []
        ];

        foreach ($students as $student) {
            $role = $student->eco_role;
            if (isset($byRole[$role])) {
                $byRole[$role][] = $student;
            } else {
                // Unknown role, put in aktivis as fallback
                $byRole['aktivis'][] = $student;
            }
        }

        // Calculate target per team
        $roles = ['peneliti', 'aktivis', 'pedagang'];
        $teams = ['team_a', 'team_b', 'team_c'];
        $teamNames = [
            'team_a' => 'Tim A - Hijau',
            'team_b' => 'Tim B - Merah',
            'team_c' => 'Tim C - Biru'
        ];

        // Create teams if they don't exist
        foreach ($teams as $i => $team) {
            $existing = DB::table('debate_groups')->where('name', $teamNames[$team])->first();
            if (!$existing) {
                $icons = ['🌿', '🔥', '💧'];
                DB::table('debate_groups')->insert([
                    'name' => $teamNames[$team],
                    'side' => 'neutral',
                    'icon' => $icons[$i],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // Get team IDs
        $teamIds = [];
        foreach ($teams as $team) {
            $group = DB::table('debate_groups')->where('name', $teamNames[$team])->first();
            $teamIds[$team] = $group->id;
        }

        // Clear existing assignments
        foreach ($students as $student) {
            DB::table('group_members')->where('student_id', $student->id)->delete();
            DB::table('users')->where('id', $student->id)->update(['debate_team' => null]);
        }

        // Distribute students evenly across teams
        // Using round-robin for each role to ensure balance
        $teamCount = array_fill_keys($teams, ['peneliti' => 0, 'aktivis' => 0, 'pedagang' => 0, 'total' => 0]);
        $assignments = [];

        foreach ($roles as $role) {
            $roleStudents = $byRole[$role];
            $count = count($roleStudents);

            if ($count === 0) continue;

            // Sort by id for consistent ordering
            usort($roleStudents, fn($a, $b) => $a->id <=> $b->id);

            // Distribute using round-robin based on current counts (prioritize teams with fewer members)
            foreach ($roleStudents as $student) {
                // Find team with minimum total members
                $minTeam = collect($teams)->sortBy(fn($t) => $teamCount[$t]['total'])->first();
                $teamCount[$minTeam][$role]++;
                $teamCount[$minTeam]['total']++;

                // Assign to group
                DB::table('group_members')->insert([
                    'debate_group_id' => $teamIds[$minTeam],
                    'student_id' => $student->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Update user's debate_team
                DB::table('users')->where('id', $student->id)->update(['debate_team' => $minTeam]);

                $assignments[] = [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'role' => $role,
                    'team' => $minTeam,
                    'team_name' => $teamNames[$minTeam]
                ];
            }
        }

        // Calculate statistics
        $stats = [];
        foreach ($teams as $team) {
            $stats[$team] = [
                'name' => $teamNames[$team],
                'total' => $teamCount[$team]['total'],
                'peneliti' => $teamCount[$team]['peneliti'],
                'aktivis' => $teamCount[$team]['aktivis'],
                'pedagang' => $teamCount[$team]['pedagang']
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil diratakan ke 3 tim!',
            'data' => [
                'total_students' => count($students),
                'stats' => $stats,
                'assignments' => $assignments
            ]
        ]);
    }

    /**
     * Assign students to groups based on their eco_role
     * Admin spin wheel assigns: Peneliti 1, Peneliti 2, Aktivis 1, Aktivis 2, Pedagang 1, Pedagang 2
     */
    public function assignByRole(\Illuminate\Http\Request $r)
    {
        $assignments = $r->input('assignments', []);

        if (empty($assignments)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data assignments'
            ], 400);
        }

        // Create groups if they don't exist
        $groupMap = [
            'peneliti_1' => ['name' => 'Peneliti 1', 'icon' => '🔬'],
            'peneliti_2' => ['name' => 'Peneliti 2', 'icon' => '🔭'],
            'aktivis_1' => ['name' => 'Aktivis 1', 'icon' => '🌿'],
            'aktivis_2' => ['name' => 'Aktivis 2', 'icon' => '🌱'],
            'pedagang_1' => ['name' => 'Pedagang 1', 'icon' => '🛒'],
            'pedagang_2' => ['name' => 'Pedagang 2', 'icon' => '💰'],
        ];

        $groupIds = [];
        foreach ($groupMap as $id => $info) {
            $existing = DB::table('debate_groups')->where('name', $info['name'])->first();
            if (!$existing) {
                DB::table('debate_groups')->insert([
                    'name' => $info['name'],
                    'icon' => $info['icon'],
                    'side' => 'neutral',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            $group = DB::table('debate_groups')->where('name', $info['name'])->first();
            $groupIds[$id] = $group->id;
        }

        // Clear existing group_members
        $studentIds = array_keys($assignments);
        DB::table('group_members')->whereIn('student_id', $studentIds)->delete();

        // Assign students to groups
        $results = [];
        foreach ($assignments as $studentId => $groupId) {
            if (isset($groupIds[$groupId])) {
                DB::table('group_members')->insert([
                    'debate_group_id' => $groupIds[$groupId],
                    'student_id' => $studentId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $student = DB::table('users')->where('id', $studentId)->first();
                $group = DB::table('debate_groups')->where('id', $groupIds[$groupId])->first();

                $results[] = [
                    'student_id' => $studentId,
                    'student_name' => $student->name ?? 'Unknown',
                    'group_id' => $groupId,
                    'group_name' => $group->name ?? 'Unknown'
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil diacak ke kelompok!',
            'data' => [
                'total' => count($results),
                'assignments' => $results
            ]
        ]);
    }

    /**
     * Get chat messages for a specific group
     */
    public function getChat($id)
    {
        $messages = \App\Models\GroupChat::with('student:id,name')
            ->where('debate_group_id', $id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'student_id' => $msg->student_id,
                    'student_name' => $msg->student->name ?? 'Unknown',
                    'message' => $msg->message,
                    'time' => $msg->created_at->format('H:i')
                ];
            });

        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * Send a new chat message to a group
     */
    public function sendChat(\Illuminate\Http\Request $r, $id)
    {
        $r->validate([
            'student_id' => 'required',
            'message' => 'required|string'
        ]);

        $chat = \App\Models\GroupChat::create([
            'debate_group_id' => $id,
            'student_id' => $r->student_id,
            'message' => $r->message
        ]);

        // Load relation
        $chat->load('student:id,name');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $chat->id,
                'student_id' => $chat->student_id,
                'student_name' => $chat->student->name ?? 'Unknown',
                'message' => $chat->message,
                'time' => $chat->created_at->format('H:i')
            ]
        ]);
    }
}
