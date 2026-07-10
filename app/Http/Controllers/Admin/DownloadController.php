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

        // 2. Preparation (Pemantik) Answers - with role
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
            'jawaban_pemantik' => [],
            'pertanyaan_pemantik' => [],
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
        // Headers: Nama, NIS, Sekolah, Jawaban Berita,
        // Pertanyaan Pemantik Universal, Jawaban Universal 1-5,
        // Pertanyaan Pemantik Peneliti, Jawaban Peneliti 1-5,
        // Pertanyaan Pemantik Aktivis, Jawaban Aktivis 1-5,
        // Pertanyaan Pemantik Pedagang, Jawaban Pedagang 1-5,
        // Pertanyaan Refleksi, Jawaban Refleksi
        $headers = [
            'No', 'Nama', 'NIS', 'Sekolah', 'Jawaban Berita',
            'Pemantik Universal - Soal 1', 'Pemantik Universal - Jawaban 1',
            'Pemantik Universal - Soal 2', 'Pemantik Universal - Jawaban 2',
            'Pemantik Universal - Soal 3', 'Pemantik Universal - Jawaban 3',
            'Pemantik Universal - Soal 4', 'Pemantik Universal - Jawaban 4',
            'Pemantik Universal - Soal 5', 'Pemantik Universal - Jawaban 5',
            'Pemantik Peneliti - Soal 1', 'Pemantik Peneliti - Jawaban 1',
            'Pemantik Peneliti - Soal 2', 'Pemantik Peneliti - Jawaban 2',
            'Pemantik Peneliti - Soal 3', 'Pemantik Peneliti - Jawaban 3',
            'Pemantik Peneliti - Soal 4', 'Pemantik Peneliti - Jawaban 4',
            'Pemantik Peneliti - Soal 5', 'Pemantik Peneliti - Jawaban 5',
            'Pemantik Aktivis - Soal 1', 'Pemantik Aktivis - Jawaban 1',
            'Pemantik Aktivis - Soal 2', 'Pemantik Aktivis - Jawaban 2',
            'Pemantik Aktivis - Soal 3', 'Pemantik Aktivis - Jawaban 3',
            'Pemantik Aktivis - Soal 4', 'Pemantik Aktivis - Jawaban 4',
            'Pemantik Aktivis - Soal 5', 'Pemantik Aktivis - Jawaban 5',
            'Pemantik Pedagang - Soal 1', 'Pemantik Pedagang - Jawaban 1',
            'Pemantik Pedagang - Soal 2', 'Pemantik Pedagang - Jawaban 2',
            'Pemantik Pedagang - Soal 3', 'Pemantik Pedagang - Jawaban 3',
            'Pemantik Pedagang - Soal 4', 'Pemantik Pedagang - Jawaban 4',
            'Pemantik Pedagang - Soal 5', 'Pemantik Pedagang - Jawaban 5',
            'Pertanyaan Refleksi', 'Jawaban Refleksi'
        ];

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

            // Add pemantik answers by role (Universal, Peneliti, Aktivis, Pedagang)
            foreach (['all', 'peneliti', 'aktivis', 'pedagang'] as $role) {
                $roleAnswers = $student['jawaban_pemantik'][$role] ?? [];
                $roleQuestions = $student['pertanyaan_pemantik'][$role] ?? [];
                for ($i = 1; $i <= 5; $i++) {
                    $row[] = $this->escapeCsv($roleQuestions[$i] ?? '');
                    $row[] = $this->escapeCsv($roleAnswers[$i] ?? '');
                }
            }

            // Refleksi
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
}
