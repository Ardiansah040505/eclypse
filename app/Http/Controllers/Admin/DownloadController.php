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
            $key = $row->student_id . '_' . substr($row->created_at, 0, 10);
            if (!isset($allData[$key])) {
                $allData[$key] = $this->createEmptyRecord($row);
            }
            $allData[$key]['jawaban_berita'][] = $row->berita_judul . ': ' . ($row->answers ?? '');
        }

        // 2. Materi Answers (Tahap 2)
        $materiAnswers = DB::table('materi_answers as ma')
            ->join('users as u', 'ma.student_id', 'u.id')
            ->leftJoin('materi_questions as mq', 'ma.question_id', 'mq.id')
            ->leftJoin('literasi_materials as lm', 'mq.material_id', 'lm.id')
            ->select(
                'u.id as student_id',
                'u.name as nama',
                'u.nis',
                'u.school as sekolah',
                'ma.answer',
                'mq.order as soal_order',
                'lm.title as materi_judul',
                'ma.created_at'
            )
            ->get();

        foreach ($materiAnswers as $row) {
            $key = $row->student_id . '_' . substr($row->created_at, 0, 10);
            if (!isset($allData[$key])) {
                $allData[$key] = $this->createEmptyRecord($row);
            }
            $materiTitle = $row->materi_judul ?? 'Literasi';
            if (!isset($allData[$key]['jawaban_materi'][$materiTitle])) {
                $allData[$key]['jawaban_materi'][$materiTitle] = [];
            }
            $allData[$key]['jawaban_materi'][$materiTitle][(int)$row->soal_order] = $row->answer ?? '';
        }

        // 3. Preparation (Pemantik) Answers - with role
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
                'pq.role as soal_role',
                'pq.question_text as soal_teks',
                'pa.created_at'
            )
            ->orderBy('pa.student_id')
            ->orderBy('pq.order')
            ->get();

        foreach ($prepAnswers as $row) {
            $key = $row->student_id . '_' . substr($row->created_at, 0, 10);
            if (!isset($allData[$key])) {
                $allData[$key] = $this->createEmptyRecord($row);
            }
            // Group by role
            $role = $row->soal_role ?? 'all';
            if (!isset($allData[$key]['jawaban_pemantik'][$role])) {
                $allData[$key]['jawaban_pemantik'][$role] = [];
            }
            $allData[$key]['jawaban_pemantik'][$role][(int)$row->soal_order] = $row->answer ?? '';
            $allData[$key]['pertanyaan_pemantik'][$role][(int)$row->soal_order] = $row->soal_teks ?? '';
        }

        // 4. Refleksi Answers (Tahap 5 preset questions)
        $refleksiAnswers = DB::table('refleksi_answers as ra')
            ->join('users as u', 'ra.student_id', 'u.id')
            ->leftJoin('refleksi_questions as rq', 'ra.question_id', 'rq.id')
            ->select(
                'u.id as student_id',
                'u.name as nama',
                'u.nis',
                'u.school as sekolah',
                'ra.answer',
                'rq.order as soal_order',
                'rq.role as soal_role',
                'ra.created_at'
            )
            ->get();

        foreach ($refleksiAnswers as $row) {
            $key = $row->student_id . '_' . substr($row->created_at, 0, 10);
            if (!isset($allData[$key])) {
                $allData[$key] = $this->createEmptyRecord($row);
            }
            $role = $row->soal_role ?? 'all';
            if (!isset($allData[$key]['jawaban_refleksi_preset'][$role])) {
                $allData[$key]['jawaban_refleksi_preset'][$role] = [];
            }
            $allData[$key]['jawaban_refleksi_preset'][$role][(int)$row->soal_order] = $row->answer ?? '';
        }

        // 5. Reflections (Questions & Answers) - Old Q&A
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
            $key = $row->student_id . '_' . substr($row->created_at, 0, 10);
            if (!isset($allData[$key])) {
                $allData[$key] = $this->createEmptyRecord($row);
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
     * Create empty record template
     */
    private function createEmptyRecord($row)
    {
        return [
            'student_id' => $row->student_id,
            'nama' => $row->nama,
            'nis' => $row->nis ?? '',
            'sekolah' => $row->sekolah ?? '',
            'date' => substr($row->created_at ?? date('Y-m-d H:i:s'), 0, 10),
            'jawaban_berita' => [],
            'jawaban_materi' => [],
            'jawaban_pemantik' => [],
            'pertanyaan_pemantik' => [],
            'jawaban_refleksi_preset' => [],
            'pertanyaan_refleksi' => [],
            'jawaban_refleksi' => [],
        ];
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
        // Ambil jumlah soal aktif untuk materi (Tahap 2)
        $materiConfigs = DB::table('materi_questions as mq')
            ->join('literasi_materials as lm', 'mq.material_id', 'lm.id')
            ->select('lm.title as materi_title', DB::raw('MAX(mq.`order`) as max_order'))
            ->groupBy('lm.title')
            ->get()
            ->pluck('max_order', 'materi_title')
            ->toArray();

        // Ambil jumlah soal aktif untuk preparation_questions (Tahap 3)
        $roleCounts = DB::table('preparation_questions')
            ->select('role', DB::raw('MAX(`order`) as max_order'))
            ->groupBy('role')
            ->pluck('max_order', 'role')
            ->toArray();

        // Ambil jumlah soal aktif untuk refleksi_questions (Tahap 5)
        $refleksiCounts = DB::table('refleksi_questions')
            ->select('role', DB::raw('MAX(`order`) as max_order'))
            ->groupBy('role')
            ->pluck('max_order', 'role')
            ->toArray();

        $maxUniversal = $roleCounts['all'] ?? 5;
        $maxPeneliti = $roleCounts['peneliti'] ?? 5;
        $maxAktivis = $roleCounts['aktivis'] ?? 5;
        $maxPedagang = $roleCounts['pedagang'] ?? 5;

        $maxRefUniversal = $refleksiCounts['all'] ?? 5;
        $maxRefPeneliti = $refleksiCounts['peneliti'] ?? 5;
        $maxRefAktivis = $refleksiCounts['aktivis'] ?? 5;
        $maxRefPedagang = $refleksiCounts['pedagang'] ?? 5;

        // Build headers dynamically
        $headers = ['No', 'Nama', 'NIS', 'Sekolah', 'Jawaban Berita'];

        // Add materi headers
        foreach ($materiConfigs as $materiTitle => $maxCount) {
            for ($i = 1; $i <= $maxCount; $i++) {
                $headers[] = $materiTitle . ' - Soal ' . $i;
            }
        }

        // Add pemantik headers
        for ($i = 1; $i <= $maxUniversal; $i++) {
            $headers[] = 'Pemantik ' . $i;
        }
        for ($i = 1; $i <= $maxPeneliti; $i++) {
            $headers[] = 'Pemantik ' . $i . ' (peneliti)';
        }
        for ($i = 1; $i <= $maxAktivis; $i++) {
            $headers[] = 'Pemantik ' . $i . ' (aktivis)';
        }
        for ($i = 1; $i <= $maxPedagang; $i++) {
            $headers[] = 'Pemantik ' . $i . ' (pedagang)';
        }

        // Add refleksi preset headers
        for ($i = 1; $i <= $maxRefUniversal; $i++) {
            $headers[] = 'Refleksi ' . $i;
        }
        for ($i = 1; $i <= $maxRefPeneliti; $i++) {
            $headers[] = 'Refleksi ' . $i . ' (peneliti)';
        }
        for ($i = 1; $i <= $maxRefAktivis; $i++) {
            $headers[] = 'Refleksi ' . $i . ' (aktivis)';
        }
        for ($i = 1; $i <= $maxRefPedagang; $i++) {
            $headers[] = 'Refleksi ' . $i . ' (pedagang)';
        }

        $headers[] = 'Pertanyaan Refleksi Q&A';
        $headers[] = 'Jawaban Refleksi Q&A';

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
            ];

            // Add materi answers
            foreach ($materiConfigs as $materiTitle => $maxCount) {
                $materiAnswers = $student['jawaban_materi'][$materiTitle] ?? [];
                for ($i = 1; $i <= $maxCount; $i++) {
                    $row[] = $this->escapeCsv($materiAnswers[$i] ?? '');
                }
            }

            // Add pemantik answers dynamically by role
            $roleConfigs = [
                'all' => $maxUniversal,
                'peneliti' => $maxPeneliti,
                'aktivis' => $maxAktivis,
                'pedagang' => $maxPedagang
            ];

            foreach ($roleConfigs as $role => $maxCount) {
                $roleAnswers = $student['jawaban_pemantik'][$role] ?? [];
                for ($i = 1; $i <= $maxCount; $i++) {
                    $row[] = $this->escapeCsv($roleAnswers[$i] ?? '');
                }
            }

            // Add refleksi preset answers
            $refleksiRoleConfigs = [
                'all' => $maxRefUniversal,
                'peneliti' => $maxRefPeneliti,
                'aktivis' => $maxRefAktivis,
                'pedagang' => $maxRefPedagang
            ];

            foreach ($refleksiRoleConfigs as $role => $maxCount) {
                $roleAnswers = $student['jawaban_refleksi_preset'][$role] ?? [];
                for ($i = 1; $i <= $maxCount; $i++) {
                    $row[] = $this->escapeCsv($roleAnswers[$i] ?? '');
                }
            }

            // Refleksi Q&A
            $row[] = $this->escapeCsv(implode(' || ', $student['pertanyaan_refleksi']));
            $row[] = $this->escapeCsv(implode(' || ', $student['jawaban_refleksi']));

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
1. No                     - Nomor urut
2. Nama                   - Nama lengkap siswa
3. NIS                    - Nomor Induk Siswa
4. Sekolah                - Nama sekolah
5. Jawaban Berita         - Jawaban siswa dari Tahap 1 (Climate News)

PEMANTIK UNIVERSAL (Semua siswa):
6-7.  Pemantik Universal - Soal 1, Jawaban 1
8-9.  Pemantik Universal - Soal 2, Jawaban 2
10-11. Pemantik Universal - Soal 3, Jawaban 3
12-13. Pemantik Universal - Soal 4, Jawaban 4
14-15. Pemantik Universal - Soal 5, Jawaban 5

PEMANTIK PENELITI (Siswa pilih Paket Peneliti):
16-17. Pemantik Peneliti - Soal 1, Jawaban 1
18-19. Pemantik Peneliti - Soal 2, Jawaban 2
20-21. Pemantik Peneliti - Soal 3, Jawaban 3
22-23. Pemantik Peneliti - Soal 4, Jawaban 4
24-25. Pemantik Peneliti - Soal 5, Jawaban 5

PEMANTIK AKTIVIS (Siswa pilih Paket Aktivis):
26-27. Pemantik Aktivis - Soal 1, Jawaban 1
28-29. Pemantik Aktivis - Soal 2, Jawaban 2
30-31. Pemantik Aktivis - Soal 3, Jawaban 3
32-33. Pemantik Aktivis - Soal 4, Jawaban 4
34-35. Pemantik Aktivis - Soal 5, Jawaban 5

PEMANTIK PEDAGANG (Siswa pilih Paket Pedagang):
36-37. Pemantik Pedagang - Soal 1, Jawaban 1
38-39. Pemantik Pedagang - Soal 2, Jawaban 2
40-41. Pemantik Pedagang - Soal 3, Jawaban 3
42-43. Pemantik Pedagang - Soal 4, Jawaban 4
44-45. Pemantik Pedagang - Soal 5, Jawaban 5

46. Pertanyaan Refleksi   - Pertanyaan siswa di Tahap 5
47. Jawaban Refleksi      - Jawaban dari guru/admin

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

    /**
     * Download Materi Literasi Answers CSV
     */
    public function materiCsv()
    {
        // Get all answers with student and question info
        $rows = DB::table('materi_answers as ma')
            ->join('users as u', 'ma.student_id', 'u.id')
            ->join('materi_questions as mq', 'ma.question_id', 'mq.id')
            ->join('literasi_materials as lm', 'mq.material_id', 'lm.id')
            ->orderBy('lm.order')
            ->orderBy('mq.order')
            ->orderBy('u.name')
            ->select(
                'u.name as nama',
                'u.nis',
                'u.school as sekolah',
                'lm.title as materi',
                'lm.icon as materi_icon',
                'mq.question_text as pertanyaan',
                'ma.answer as jawaban',
                'ma.created_at as waktu'
            )
            ->get();

        // Generate CSV
        $csv = "\xEF\xBB\xBFNo,Nama,NIS,Sekolah,Materi,Icon,No Soal,pertanyaan,Jawaban,Waktu\n";

        $no = 1;
        $currentStudent = null;
        $questionCounter = [];

        foreach ($rows as $r) {
            // Track question number per material per student
            $key = $r->nama . '_' . $r->materi;
            if (!isset($questionCounter[$key])) {
                $questionCounter[$key] = 0;
            }
            $questionCounter[$key]++;

            $line = $no++ . ',';
            $line .= '"' . str_replace('"', '""', $r->nama ?? '') . '",';
            $line .= '"' . ($r->nis ?? '') . '",';
            $line .= '"' . str_replace('"', '""', $r->sekolah ?? '') . '",';
            $line .= '"' . str_replace('"', '""', $r->materi ?? '') . '",';
            $line .= '"' . ($r->materi_icon ?? '') . '",';
            $line .= $questionCounter[$key] . ',';
            $line .= '"' . str_replace('"', '""', $r->pertanyaan ?? '') . '",';
            $line .= '"' . str_replace('"', '""', $r->jawaban ?? '') . '",';
            $line .= '"' . ($r->waktu ?? '') . "\"\n";
            $csv .= $line;
        }

        return response()->streamDownload(
            fn() => print($csv),
            'Jawaban_Materi_' . date('Y-m-d') . '.csv',
            ['Content-Type' => 'text/csv; charset=utf-8']
        );
    }
}
