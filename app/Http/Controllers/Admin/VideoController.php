<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningVideo;
use Illuminate\Http\Request;

class VideoController extends Controller
{
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
     * POST /admin/video
     *
     * Payload options:
     * - Single video: { youtube_url, title, description, stage, order }
     * - Multiple videos: { videos: [{ youtube_url, title, description, order }, ...], stage }
     */
    public function save(Request $request)
    {
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
     * DELETE /admin/video/{id}
     */
    public function delete($id)
    {
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
     * POST /admin/video/{id}/toggle
     */
    public function toggle($id)
    {
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
