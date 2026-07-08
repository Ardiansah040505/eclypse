<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class DownloadController extends Controller
{
    /**
     * Download all recap data as ZIP with CSV files per day
     */
    public function allCsv()
    {
        // Collect all data from different tables
        $data = $this->collectAllData();

        // Group by date
        $grouped = $this->groupByDate($data);

        if (empty($grouped)) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada data untuk diunduh'
            ]);
        }

        // Create ZIP file
        $zip = new ZipArchive();
        $zipFileName = 'Rekap_ECLYPSE_' . date('Y-m-d_His') . '.zip';
        $tempFile = tempnam(sys_get_temp_dir(), 'zip');

        if ($zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat file ZIP'
            ]);
        }

        // Create CSV for each date
        foreach ($grouped as $date => $students) {
            $csv = $this->generateCsv($date, $students);
            $zip->addFromString($date . '.csv', "\xEF\xBB\xBF" . $csv);
        }

        // Add README file
        $readme = $this->generateReadme(count($grouped));
        $zip->addFromString('README.txt', $readme);

        $zip->close();

        return response()->download($tempFile, $zipFileName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Collect all data from database
     */
    private function collectAllData()
    {
        $allData = [];

        // 1. News Answers - join dengan users
        $newsAnswers = DB::table('student_news_answers as sna')
            ->join('users as u', 'sna.student_id', 'u.id')
            ->leftJoin('learning_news as ln', 'sna.news_id', 'ln.id')
            ->select(
                'u.id as student_id',
                'u.name as nama',
                'u.nis',
                'u.school as sekolah',
                'sna.answers',
                'ln.title as berita_judul',
                'sna.created_at'
            )
            ->get();

        foreach ($newsAnswers as $row) {
            $key = $row->student_id . '_' . $row->created_at;
            if (!isset($allData[$key])) {
                $allData[$key] = [
                    'student_id' => $row->student_id,
                    'nama' => $row->nama,
                    'nis' => $row->nis ?? '',
                    'sekolah' => $row->sekolah ?? '',
                    'date' => substr($row->created_at, 0, 10),
                    'jawaban_berita' => [],
                    'jawaban_pemantik' => [],
                    'pertanyaan_refleksi' => [],
                    'jawaban_refleksi' => [],
                ];
            }
            $allData[$key]['jawaban_berita'][] = $row->berita_judul . ': ' . ($row->answers ?? '');
        }

        // 2. Preparation (Pemantik) Answers
        $prepAnswers = DB::table('preparation_answers as pa')
            ->join('users as u', 'pa.student_id', 'u.id')
            ->leftJoin('preparation_questions as pq', 'pa.question_id', 'pq.id')
            ->select(
                'u.id as student_id',
                'u.name as nama',
                'u.nis',
                'u.school as sekolah',
                'pa.answer',
                'pq.order as soal_order',
                'pa.created_at'
            )
            ->orderBy('pa.student_id')
            ->orderBy('pq.order')
            ->get();

        foreach ($prepAnswers as $row) {
            $key = $row->student_id . '_' . $row->created_at;
            if (!isset($allData[$key])) {
                $allData[$key] = [
                    'student_id' => $row->student_id,
                    'nama' => $row->nama,
                    'nis' => $row->nis ?? '',
                    'sekolah' => $row->sekolah ?? '',
                    'date' => substr($row->created_at, 0, 10),
                    'jawaban_berita' => [],
                    'jawaban_pemantik' => [],
                    'pertanyaan_refleksi' => [],
                    'jawaban_refleksi' => [],
                ];
            }
            $allData[$key]['jawaban_pemantik'][(int)$row->soal_order] = $row->answer ?? '';
        }

        // 3. Reflections (Questions & Answers)
        $reflections = DB::table('reflections as r')
            ->join('users as u', 'r.user_id', 'u.id')
            ->leftJoin('users as admin', 'r.answered_by', 'admin.id')
            ->select(
                'u.id as student_id',
                'u.name as nama',
                'u.nis',
                'u.school as sekolah',
                'r.question as pertanyaan',
                'r.answer as jawaban',
                'admin.name as dijawab_oleh',
                'r.created_at'
            )
            ->get();

        foreach ($reflections as $row) {
            $key = $row->student_id . '_' . $row->created_at;
            if (!isset($allData[$key])) {
                $allData[$key] = [
                    'student_id' => $row->student_id,
                    'nama' => $row->nama,
                    'nis' => $row->nis ?? '',
                    'sekolah' => $row->sekolah ?? '',
                    'date' => substr($row->created_at, 0, 10),
                    'jawaban_berita' => [],
                    'jawaban_pemantik' => [],
                    'pertanyaan_refleksi' => [],
                    'jawaban_refleksi' => [],
                ];
            }
            if ($row->pertanyaan) {
                $allData[$key]['pertanyaan_refleksi'][] = $row->pertanyaan;
            }
            if ($row->jawaban) {
                $allData[$key]['jawaban_refleksi'][] = '(' . ($row->dijawab_oleh ?? 'Guru') . '): ' . $row->jawaban;
            }
        }

        return $allData;
    }

    /**
     * Group data by date
     */
    private function groupByDate($data)
    {
        $grouped = [];

        foreach ($data as $row) {
            $date = $row['date'];
            if (!isset($grouped[$date])) {
                $grouped[$date] = [];
            }
            // Use student_id + date as key to avoid duplicates
            $key = $row['student_id'] . '_' . $row['nama'];
            $grouped[$date][$key] = $row;
        }

        return $grouped;
    }

    /**
     * Generate CSV content for a specific date
     */
    private function generateCsv($date, $students)
    {
        $headers = ['No', 'Nama', 'NIS', 'Sekolah', 'Jawaban Berita', 'Pemantik 1', 'Pemantik 2', 'Pemantik 3', 'Pemantik 4', 'Pemantik 5', 'Pertanyaan Refleksi', 'Jawaban Refleksi'];

        $lines = [];
        $lines[] = implode(',', $headers);

        $no = 1;
        foreach ($students as $student) {
            $row = [
                $no++,
                $this->escapeCsv($student['nama']),
                $this->escapeCsv($student['nis']),
                $this->escapeCsv($student['sekolah']),
                $this->escapeCsv(implode(' | ', $student['jawaban_berita'])),
                $this->escapeCsv($student['jawaban_pemantik'][1] ?? ''),
                $this->escapeCsv($student['jawaban_pemantik'][2] ?? ''),
                $this->escapeCsv($student['jawaban_pemantik'][3] ?? ''),
                $this->escapeCsv($student['jawaban_pemantik'][4] ?? ''),
                $this->escapeCsv($student['jawaban_pemantik'][5] ?? ''),
                $this->escapeCsv(implode(' || ', $student['pertanyaan_refleksi'])),
                $this->escapeCsv(implode(' || ', $student['jawaban_refleksi'])),
            ];
            $lines[] = implode(',', $row);
        }

        return implode("\n", $lines);
    }

    /**
     * Escape CSV value
     */
    private function escapeCsv($value)
    {
        $str = $value === null ? '' : (string)$value;
        if ($str === '') {
            return '';
        }
        $str = str_replace('"', '""', $str);
        if (strpos($str, ',') !== false || strpos($str, '"') !== false || strpos($str, "\n") !== false) {
            return '"' . $str . '"';
        }
        return $str;
    }

    /**
     * Generate README content
     */
    private function generateReadme($count)
    {
        $readme = <<<EOT
REKAP DATA ECLYPSE
==================

File ini berisi data jawaban siswa dari platform pembelajaran iklim ECLYPSE.

STRUKTUR FILE:
- Tiap file CSV berisi data siswa per tanggal pembelajaran
- Nama file CSV = tanggal pembelajaran (format: YYYY-MM-DD.csv)

KOLOM CSV:
1. No          - Nomor urut
2. Nama        - Nama lengkap siswa
3. NIS         - Nomor Induk Siswa
4. Sekolah     - Nama sekolah
5. Jawaban Berita - Jawaban siswa dari Tahap 1 (Climate News)
6. Pemantik 1-5 - Jawaban 5 pertanyaan pemantik dari Tahap 3
7. Pertanyaan Refleksi - Pertanyaan yang diajukan siswa di Tahap 5
8. Jawaban Refleksi - Jawaban dari guru/admin

TANGGAL DOWNLOAD: {date}
JUMLAH FILE CSV: {count} file

---
ECLYPSE - Climate Learning Platform
EOT;

        return str_replace(
            ['{date}', '{count}'],
            [date('Y-m-d H:i:s'), $count],
            $readme
        );
    }

    /**
     * Download Prep CSV (old endpoint - kept for compatibility)
     */
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
