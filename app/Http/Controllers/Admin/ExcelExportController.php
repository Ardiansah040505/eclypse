<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExcelExportController extends Controller
{
    /**
     * Download Excel report per class (kelas)
     */
    public function downloadPerSchool(Request $request)
    {
        // Group by: sekolah + kelas
        $classes = User::where('role', 'student')
            ->whereNotNull('school')
            ->select('school', 'kelas')
            ->distinct()
            ->orderBy('school')
            ->orderBy('kelas')
            ->get()
            ->map(function ($item) {
                $kelasName = $item->kelas ?? 'Tanpa Kelas';
                return [
                    'school' => $item->school,
                    'kelas' => $kelasName,
                    'key' => $item->school . '|' . $kelasName
                ];
            });

        if ($classes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada data siswa'
            ]);
        }

        // Create new spreadsheet
        $spreadsheet = new Spreadsheet();

        $tahapConfig = [
            'a' => [
                'name' => 'Tahap 1 - Climate News',
                'table' => 'student_news_answers',
                'join_table' => 'learning_news',
                'join_on' => 'news_id',
                'join_select' => 'title as source_title',
                'answer_field' => 'answers',
                'prefix' => 'a',
                'questions_table' => 'news_questions',
                'questions_join' => 'news_id',
                'questions_source' => 'news_id'
            ],
            'b' => [
                'name' => 'Tahap 2 - Literasi',
                'table' => 'materi_answers',
                'join_table' => 'materi_questions',
                'join_on' => 'question_id',
                'join_select' => 'question_text as source_title',
                'answer_field' => 'answer',
                'prefix' => 'b',
                'questions_table' => 'materi_questions',
                'questions_join' => 'id',
                'questions_source' => 'question_id'
            ],
            'c' => [
                'name' => 'Tahap 3 - Pemantik',
                'table' => 'preparation_answers',
                'join_table' => 'preparation_questions',
                'join_on' => 'question_id',
                'join_select' => 'question_text as source_title',
                'answer_field' => 'answer',
                'prefix' => 'c',
                'questions_table' => 'preparation_questions',
                'questions_join' => 'id',
                'questions_source' => 'question_id'
            ],
            'd' => [
                'name' => 'Tahap 5 - Refleksi',
                'table' => 'reflections',
                'join_table' => null,
                'join_on' => null,
                'join_select' => 'question as source_title',
                'answer_field' => 'answer',
                'prefix' => 'd',
                'questions_table' => null,
                'questions_join' => null,
                'questions_source' => null
            ]
        ];

        $isFirst = true;
        foreach ($classes as $class) {
            $school = $class['school'];
            $kelas = $class['kelas'];
            $key = $class['key'];

            // Create or get sheet for this class
            $sheetName = $this->cleanSheetName($kelas);

            // Resolve duplicate sheet names (excel sheet name must be unique and <= 31 characters)
            $originalSheetName = $sheetName;
            $suffix = 1;
            while ($spreadsheet->sheetNameExists($sheetName)) {
                $maxLen = 31 - strlen(" ($suffix)");
                $sheetName = substr($originalSheetName, 0, $maxLen) . " ($suffix)";
                $suffix++;
            }

            if ($isFirst) {
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->setTitle($sheetName);
                $isFirst = false;
            } else {
                $sheet = new Worksheet($spreadsheet, $sheetName);
            }

            // Get students from this class
            $students = User::where('role', 'student')
                ->where('school', $school)
                ->where(function ($query) use ($kelas) {
                    if ($kelas === 'Tanpa Kelas') {
                        $query->whereNull('kelas')->orWhere('kelas', '');
                    } else {
                        $query->where('kelas', $kelas);
                    }
                })
                ->orderBy('absen')
                ->orderBy('name')
                ->get();

            // Build dynamic columns based on available questions
            $columns = ['Nama', 'Absen'];
            $columnQuestions = [];

            // Get all available questions for each tahap
            foreach ($tahapConfig as $tahap => $config) {
                $questions = $this->getQuestions($config);
                $roleCounters = [];
                foreach ($questions as $idx => $question) {
                    $prefix = $config['prefix'];
                    
                    if ($config['questions_table'] == 'preparation_questions') {
                        $role = $question['source']; // 'Universal', 'Peneliti', 'Aktivis', 'Pedagang'
                        if (!isset($roleCounters[$role])) {
                            $roleCounters[$role] = 0;
                        }
                        $roleIdx = $roleCounters[$role]++;
                        $columnCode = 'soal ' . ($roleIdx + 1) . $prefix . ' (' . $role . ')';
                    } else {
                        $columnCode = 'soal ' . ($idx + 1) . $prefix;
                    }
                    
                    $columns[] = $columnCode;
                    $columnQuestions[$columnCode] = [
                        'tahap' => $tahap,
                        'question_id' => $question['id'],
                        'questions_table' => $config['questions_table']
                    ];
                }
            }

            // Set column headers
            $colIndex = 1;
            foreach ($columns as $colName) {
                $cell = $sheet->getCellByColumnAndRow($colIndex, 1);
                $cell->setValue($colName);

                // Header styling
                $cell->getStyle()
                    ->applyFromArray([
                        'font' => [
                            'bold' => true,
                            'color' => ['rgb' => 'FFFFFF']
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => '1B4332']
                        ],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER
                        ],
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => '2D6A4F']
                            ]
                        ]
                    ]);
                $colIndex++;
            }

            // Add school info row
            $sheet->getCellByColumnAndRow(1, 2)->setValue('Sekolah:');
            $sheet->getCellByColumnAndRow(2, 2)->setValue($school);
            $sheet->getCellByColumnAndRow(3, 2)->setValue('Kelas:');
            $sheet->getCellByColumnAndRow(4, 2)->setValue($kelas);

            // Style info row
            $sheet->getStyle('A2:' . $this->getColumnLetter(count($columns)) . '2')
                ->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E8F5E9']
                    ]
                ]);

            // Fill student data starting from row 3
            $rowIndex = 3;
            $studentIds = $students->pluck('id')->toArray();

            foreach ($students as $student) {
                $colIndex = 1;

                // Nama
                $sheet->getCellByColumnAndRow($colIndex++, $rowIndex)->setValue($student->name);
                // Absen
                $sheet->getCellByColumnAndRow($colIndex++, $rowIndex)->setValue($student->absen ?? '');

                // Get answers for each column
                $answers = $this->getAnswersForStudent($student->id, $tahapConfig);

                foreach (array_slice($columns, 2) as $colIdx => $colName) {
                    $cell = $sheet->getCellByColumnAndRow($colIdx + 3, $rowIndex);

                    // Find answer for this column
                    $answer = $this->findAnswerForColumn($colName, $answers, $columnQuestions);
                    $cell->setValue($answer ?? '');

                    // Apply wrap text for answer columns
                    $cell->getStyle()->getAlignment()->setWrapText(true);
                }

                // Zebra striping
                if ($rowIndex % 2 == 0) {
                    $lastCol = count($columns);
                    $sheet->getStyle("A{$rowIndex}:{$this->getColumnLetter($lastCol)}{$rowIndex}")
                        ->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'F0FDF4']
                            ]
                        ]);
                }

                // Apply borders to all cells in row
                $lastCol = count($columns);
                $sheet->getStyle("A{$rowIndex}:{$this->getColumnLetter($lastCol)}{$rowIndex}")
                    ->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => 'D1D5DB']
                            ]
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_TOP
                        ]
                    ]);

                $rowIndex++;
            }

            // Set auto-width for columns
            $colCount = count($columns);
            for ($i = 1; $i <= $colCount; $i++) {
                $sheet->getColumnDimension($this->getColumnLetter($i))->setAutoSize(true);
            }

            // Set minimum width for answer columns
            for ($i = 3; $i <= $colCount; $i++) {
                $letter = $this->getColumnLetter($i);
                if ($sheet->getColumnDimension($letter)->getWidth() < 15) {
                    $sheet->getColumnDimension($letter)->setWidth(15);
                }
            }

            // Set minimum width for Nama and Absen columns
            $sheet->getColumnDimension('A')->setWidth(20);
            $sheet->getColumnDimension('B')->setWidth(8);

            // Freeze header row (row 1)
            $sheet->freezePane('A2');

            // Set title row height
            $sheet->getRowDimension(1)->setRowHeight(25);
        }

        // Create Excel file
        $writer = new Xlsx($spreadsheet);

        // Generate filename with date
        $filename = 'Rekap_ECLYPSE_' . date('Y-m-d_His') . '.xlsx';

        // Save to temp file
        $tempFile = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ])->deleteFileAfterSend(true);
    }

    /**
     * Get questions for each tahap
     */
    private function getQuestions($config)
    {
        $questions = [];

        if ($config['questions_table'] == 'news_questions') {
            // News questions
            $news = DB::table('learning_news')->get();
            foreach ($news as $n) {
                $nQuestions = DB::table('news_questions')
                    ->where('learning_news_id', $n->id)
                    ->orderBy('order')
                    ->get();
                foreach ($nQuestions as $q) {
                    $questions[] = [
                        'id' => $q->id,
                        'text' => $q->question,
                        'source' => $n->title
                    ];
                }
            }
        } elseif ($config['questions_table'] == 'materi_questions') {
            // Materi questions
            $materials = DB::table('literasi_materials')->orderBy('order')->get();
            foreach ($materials as $mat) {
                $mQuestions = DB::table('materi_questions')
                    ->where('material_id', $mat->id)
                    ->orderBy('order')
                    ->get();
                foreach ($mQuestions as $q) {
                    $questions[] = [
                        'id' => $q->id,
                        'text' => $q->question_text,
                        'source' => $mat->title
                    ];
                }
            }
        } elseif ($config['questions_table'] == 'preparation_questions') {
            // Preparation questions - grouped by role
            $roles = ['all', 'peneliti', 'aktivis', 'pedagang'];
            foreach ($roles as $role) {
                $pQuestions = DB::table('preparation_questions')
                    ->where('role', $role)
                    ->orderBy('order')
                    ->get();
                foreach ($pQuestions as $q) {
                    $questions[] = [
                        'id' => $q->id,
                        'text' => $q->question_text,
                        'source' => $role == 'all' ? 'Universal' : ucfirst($role)
                    ];
                }
            }
        } elseif ($config['questions_table'] == null) {
            // Reflections - questions are from student's own input
            // We'll just return the reflection records themselves
        }

        return $questions;
    }

    /**
     * Get all answers for a student grouped by tahap
     */
    private function getAnswersForStudent($studentId, $tahapConfig)
    {
        $answers = [
            'news_questions' => [],
            'materi_questions' => [],
            'preparation_questions' => [],
            'reflections' => []
        ];

        // Tahap 1 - News Answers
        $newsAnswers = DB::table('student_news_answers')
            ->where('student_id', $studentId)
            ->get();
        foreach ($newsAnswers as $ans) {
            $questionIds = DB::table('news_questions')
                ->where('learning_news_id', $ans->news_id)
                ->orderBy('order')
                ->pluck('id');
            $allAnswers = is_array($ans->answers) ? $ans->answers : json_decode($ans->answers ?? '[]', true);
            if (!is_array($allAnswers)) {
                $allAnswers = [];
            }
            foreach ($questionIds as $idx => $qId) {
                $answers['news_questions'][$qId] = $allAnswers[$idx] ?? null;
            }
        }

        // Tahap 2 - Materi Answers
        $materiAnswers = DB::table('materi_answers')
            ->where('student_id', $studentId)
            ->get();
        foreach ($materiAnswers as $ans) {
            $answers['materi_questions'][$ans->question_id] = $ans->answer;
        }

        // Tahap 3 - Preparation Answers
        $prepAnswers = DB::table('preparation_answers')
            ->where('student_id', $studentId)
            ->get();
        foreach ($prepAnswers as $ans) {
            $answers['preparation_questions'][$ans->question_id] = $ans->answer;
        }

        // Tahap 5 - Reflections
        $reflections = DB::table('reflections')
            ->where('user_id', $studentId)
            ->get();
        foreach ($reflections as $ref) {
            $answers['reflections'][] = $ref->answer;
        }

        return $answers;
    }

    /**
     * Find answer for a specific column (e.g., 'aa', 'c_peneliti_a')
     */
    private function findAnswerForColumn($column, $answers, $columnQuestions)
    {
        if (!isset($columnQuestions[$column])) {
            return null;
        }

        $colInfo = $columnQuestions[$column];
        $questionId = $colInfo['question_id'];
        $table = $colInfo['questions_table'];

        // Find answer
        if ($table == 'news_questions') {
            return $answers['news_questions'][$questionId] ?? null;
        } elseif ($table == 'materi_questions') {
            return $answers['materi_questions'][$questionId] ?? null;
        } elseif ($table == 'preparation_questions') {
            return $answers['preparation_questions'][$questionId] ?? null;
        } elseif ($table == null) {
            // Reflections
            return $answers['reflections'][0] ?? null;
        }

        return null;
    }

    /**
     * Clean sheet name for Excel
     */
    private function cleanSheetName($name)
    {
        // Excel sheet names max 31 chars
        $name = preg_replace('/[\\/*?:\[\]]/', '', $name);
        $name = trim($name);
        if (strlen($name) > 28) {
            $name = substr($name, 0, 28);
        }
        return $name ?: 'Sheet1';
    }

    /**
     * Get column letter from index
     */
    private function getColumnLetter($index)
    {
        $letter = '';
        while ($index > 0) {
            $index--;
            $letter = chr(65 + ($index % 26)) . $letter;
            $index = intval($index / 26);
        }
        return $letter;
    }
}
