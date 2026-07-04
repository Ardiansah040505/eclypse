<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DownloadPrepController extends Controller
{
    // GET /admin/download/prep-csv
    public function prepCsv()
    {
        $rows = DB::table('preparation_answers as pa')
            ->join('users as u', 'pa.student_id', 'u.id')
            ->join('preparation_questions as pq', 'pa.question_id', 'pq.id')
            ->orderBy('pq.order')
            ->orderBy('u.name')
            ->select('u.name', 'u.nis', 'u.sekolah', 'pq.question_text', 'pa.answer', 'pa.created_at')
            ->get();

        $csv = "Nama,NIS,Sekolah,Soal,Jawaban,Waktu\n";
        foreach ($rows as $r) {
            $csv .= '"' . str_replace('"', '""', $r->name) . '","' . $r->nis . '","' . str_replace('"', '""', $r->sekolah ?? '') . '","' . str_replace('"', '""', $r->question_text) . '","' . str_replace('"', '""', $r->answer) . '","' . $r->created_at . "\"\n";
        }

        return response()->streamDownload(fn () => $csv, 'prep Jawaban_' . date('Ymd') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
