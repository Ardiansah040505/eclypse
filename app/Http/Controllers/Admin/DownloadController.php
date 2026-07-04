<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DownloadController extends Controller
{
    public function prepCsv()
    {
        $rows = DB::table('preparation_answers as pa')
            ->join('users as u', 'pa.student_id', 'u.id')
            ->join('preparation_questions as pq', 'pa.question_id', 'pq.id')
            ->orderBy('pq.order')->orderBy('u.name')
            ->select('u.name', 'u.nis', 'pq.question_text', 'pa.answer', 'pa.created_at')
            ->get();

        $csv = "\xEF\xBB\xBFNama,NIS,Soal,Jawaban,Waktu\n";
        foreach ($rows as $r) {
            $line = '"' . str_replace('"', '""', $r->name) . '",';
            $line .= '"' . ($r->nis ?? '') . '",';
            $line .= '"' . str_replace('"', '""', $r->question_text ?? '') . '",';
            $line .= '"' . str_replace('"', '""', $r->answer ?? '') . '",';
            $line .= '"' . ($r->created_at ?? '') . "\"\n";
            $csv .= $line;
        }

        return response()->streamDownload(fn() => print($csv), 'Jawaban_Persiapan_' . date('Ymd') . '.csv', ['Content-Type' => 'text/csv; charset=utf-8']);
    }
}
