<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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

        $id = DB::table('debate_groups')->insertGetId([
            'name' => $r->name,
            'side' => $side,
            'icon' => $icon,
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

        // Update last_seen dengan timestamp sekarang (dalam detik)
        \App\Models\User::where('id', $studentId)->update(['last_seen' => now()]);

        // Get group of student
        $member = DB::table('group_members')
            ->where('student_id', $studentId)
            ->first();

        $group = null;
        if ($member) {
            $group = DB::table('debate_groups')
                ->where('id', $member->debate_group_id)
                ->first();

            if ($group) {
                // Get all members of this group
                $group->members = DB::table('group_members as gm')
                    ->join('users as u', 'gm.student_id', 'u.id')
                    ->where('gm.debate_group_id', $group->id)
                    ->select('u.id', 'u.name', 'u.nis', 'u.school as sekolah')
                    ->get();
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
     * Get current logged-in user from session (for page refresh restore)
     */
    public function me()
    {
        $studentId = session('student_id');
        $adminId   = session('admin_id');

        if ($studentId) {
            $user = \App\Models\User::find($studentId);
            if ($user) {
                return response()->json([
                    'success'  => true,
                    'user'     => $user,
                    'is_admin' => false,
                ]);
            }
        }

        if ($adminId) {
            $user = \App\Models\User::find($adminId);
            if ($user) {
                return response()->json([
                    'success'  => true,
                    'user'     => $user,
                    'is_admin' => true,
                ]);
            }
        }

        return response()->json(['success' => false]);
    }
}
