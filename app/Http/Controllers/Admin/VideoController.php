<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningVideo;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    /**
     * Check if request is from authenticated admin
     */
    private function isAdminRequest(Request $request): bool
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        return !empty($adminId);
    }

    /**
     * Get authenticated admin user
     */
    private function getAdminUser(Request $request)
    {
        $adminId = $request->header('X-Admin-Id') ?: $request->input('admin_id');
        if (!$adminId) return null;

        return \App\Models\User::where('id', $adminId)
            ->where('role', 'admin')
            ->first();
    }

    /**
     * Ambil video aktif berdasarkan stage (default: tahap2)
     * GET /video?stage=tahap2
     */
    public function show(Request $request)
    {
        $stage = $request->get('stage', 'tahap2');

        $videos = LearningVideo::where('is_active', true)
            ->where('stage', $stage)
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $videos,
            'stage' => $stage,
            'count' => $videos->count()
        ]);
    }

    /**
     * Simpan/update video(s)
     * POST /api/admin/video
     * Requires X-Admin-Id header or admin_id input
     */
    public function save(Request $request)
    {
        if (!$this->isAdminRequest($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Akses hanya untuk guru/admin.'
            ], 401);
        }

        $stage = $request->get('stage', $request->input('stage', 'tahap2'));

        // Handle multiple videos
        if ($request->has('videos') && is_array($request->videos)) {
            // Deactivate all videos for this stage
            LearningVideo::where('stage', $stage)->update(['is_active' => false]);

            $createdVideos = [];
            foreach ($request->videos as $index => $videoData) {
                if (!empty($videoData['youtube_url'])) {
                    $video = LearningVideo::create([
                        'title' => $videoData['title'] ?? 'Video ' . ($index + 1),
                        'youtube_url' => $videoData['youtube_url'],
                        'description' => $videoData['description'] ?? '',
                        'is_active' => true,
                        'stage' => $stage,
                        'order' => $videoData['order'] ?? $index,
                    ]);
                    $createdVideos[] = $video;
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($createdVideos) . ' video berhasil disimpan',
                'data' => $createdVideos
            ]);
        }

        // Handle single video (legacy support)
        $youtubeUrl = $request->youtube_url ?? $request->input('youtube_url', '');

        // Jika youtube_url kosong, hapus video aktif untuk stage ini
        if (empty($youtubeUrl)) {
            LearningVideo::where('stage', $stage)->update(['is_active' => false]);
            return response()->json([
                'success' => true,
                'message' => 'Video dihapus',
                'data' => (object)[
                    'youtube_url' => '',
                    'title' => '',
                    'description' => '',
                    'is_active' => false,
                    'stage' => $stage,
                    'order' => 0
                ]
            ]);
        }

        // Nonaktifkan semua video untuk stage ini
        LearningVideo::where('stage', $stage)->update(['is_active' => false]);

        // Buat video baru
        $video = LearningVideo::create([
            'title' => $request->title ?? 'Video Pembelajaran',
            'youtube_url' => $youtubeUrl,
            'description' => $request->description ?? '',
            'is_active' => true,
            'stage' => $stage,
            'order' => $request->order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil disimpan',
            'data' => $video
        ]);
    }

    /**
     * Hapus video berdasarkan ID
     * DELETE /api/admin/video/{id}
     * Requires X-Admin-Id header
     */
    public function delete(Request $request, $id)
    {
        if (!$this->isAdminRequest($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Akses hanya untuk guru/admin.'
            ], 401);
        }

        $video = LearningVideo::find($id);

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video tidak ditemukan'
            ], 404);
        }

        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil dihapus'
        ]);
    }

    /**
     * Toggle active status video
     * POST /api/admin/video/{id}/toggle
     * Requires X-Admin-Id header
     */
    public function toggle(Request $request, $id)
    {
        if (!$this->isAdminRequest($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Akses hanya untuk guru/admin.'
            ], 401);
        }

        $video = LearningVideo::find($id);

        if (!$video) {
            return response()->json([
                'success' => false,
                'message' => 'Video tidak ditemukan'
            ], 404);
        }

        $video->is_active = !$video->is_active;
        $video->save();

        return response()->json([
            'success' => true,
            'message' => $video->is_active ? 'Video diaktifkan' : 'Video dinonaktifkan',
            'data' => $video
        ]);
    }
}
