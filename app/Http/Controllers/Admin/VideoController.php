<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningVideo;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    /**
     * Ambil video aktif
     * GET /video
     */
    public function show()
    {
        $video = LearningVideo::where('is_active', true)->first();

        return response()->json([
            'success' => true,
            'data' => $video ?: (object)[
                'youtube_url' => '',
                'title' => '',
                'description' => '',
                'is_active' => false
            ]
        ]);
    }

    /**
     * Update atau buat video
     * POST /admin/video
     */
    public function save(Request $request)
    {
        // Nonaktifkan semua video
        LearningVideo::where('is_active', true)->update(['is_active' => false]);

        // Jika youtube_url kosong, hapus video aktif
        if (empty($request->youtube_url)) {
            return response()->json([
                'success' => true,
                'message' => 'Video dihapus',
                'data' => (object)[
                    'youtube_url' => '',
                    'title' => '',
                    'description' => '',
                    'is_active' => false
                ]
            ]);
        }

        // Buat video baru
        $video = LearningVideo::create([
            'title' => $request->title ?? 'Video Pembelajaran',
            'youtube_url' => $request->youtube_url,
            'description' => $request->description ?? '',
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Video berhasil disimpan',
            'data' => $video
        ]);
    }
}
