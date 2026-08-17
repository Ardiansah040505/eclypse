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
     * Download Excel report per school
     */
    public function downloadPerSchool(Request $request)
    {
        $schools = User::where('role', 'student')
            ->whereNotNull('school')
            ->distinct()
            ->pluck('school');

        if ($schools->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada data siswa'
            ]);
        }

        // Create new spreadsheet
        $spreadsheet = new Spreadsheet();

        // Remove default sheet
        $spreadsheet->discardActiveWorksheet();
        $spreadsheet->removeSheetByIndex(0);

        $tahapConfig = [
            1 => [
                'name' => 'Tahap 1 - Climate News',
                'table' => 'student_news_answers',
                'join_table' => 'learning_news',
                'join_on' => 'news_id',
                'join_select' => 'title as source_title',
                'answer_field' => 'answers',
                'prefix' => '1',
                'questions_table' => 'news_questions',
                'questions_join' => 'news_id',
                'questions_source' => 'news_id'
            ],
            2 => [
                'name' => 'Tahap 2 - Literasi',
                'table' => 'materi_answers',
                'join_table' => 'materi_questions',
                'join_on' => 'question_id',
                'join_select' => 'question_text as source_title',
                'answer_field' => 'answer',
                'prefix' => '2',
                'questions_table' => 'materi_questions',
                'questions_join' => 'id',
                'questions_source' => 'question_id'
            ],
            3 => [
                'name' => 'Tahap 3 - Pemantik',
                'table' => 'preparation_answers',
                'join_table' => 'preparation_questions',
                'join_on' => 'question_id',
                'join_select' => 'question_text as source_title',
                'answer_field' => 'answer',
                'prefix' => '3',
                'questions_table' => 'preparation_questions',
                'questions_join' => 'id',
                'questions_source' => 'question_id'
            ],
            5 => [
                'name' => 'Tahap 5 - Refleksi',
                'table' => 'reflections',
                'join_table' => null,
                'join_on' => null,
                'join_select' => 'question as source_title',
                'answer_field' => 'answer',
                'prefix' => '5',
                'questions_table' => null,
                'questions_join' => null,
                'questions_source' => null
            ]
        ];

        foreach ($schools as $school) {
            // Create new sheet for this school
            $sheetName = $this->cleanSheetName($school);
            $sheet = new Worksheet($spreadsheet, $sheetName);

            // Get students from this school
            $students = User::where('role', 'student')
                ->where('school', $school)
                ->orderBy('name')
                ->get();

            // Build dynamic columns based on available questions
            $columns = ['Nama', 'NIS'];
            $questionMap = []; // question_id => column_letter

            // Get all available questions for each tahap
            foreach ($tahapConfig as $tahap => $config) {
                $questions = $this->getQuestions($config);
                foreach ($questions as $idx => $question) {
                    $columnCode = $config['prefix'] . chr(97 + $idx); // 1a, 1b, 2a, etc
                    $columns[] = $columnCode;
                    $questionMap[$question['id']] = [
                        'column' => $columnCode,
                        'tahap' => $tahap
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

            // Fill student data
            $rowIndex = 2;
            $studentIds = $students->pluck('id')->toArray();

            foreach ($students as $student) {
                $colIndex = 1;

                // Nama
                $sheet->getCellByColumnAndRow($colIndex++, $rowIndex)->setValue($student->name);
                // NIS
                $sheet->getCellByColumnAndRow($colIndex++, $rowIndex)->setValue($student->nis ?? '');

                // Get answers for each column
                $answers = $this->getAnswersForStudent($student->id, $tahapConfig);

                foreach (array_slice($columns, 2) as $colIdx => $colName) {
                    $cell = $sheet->getCellByColumnAndRow($colIdx + 3, $rowIndex);

                    // Find answer for this column
                    $answer = $this->findAnswerForColumn($colName, $answers, $tahapConfig);
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

            // Freeze header row
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
        $answers = [];

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
     * Find answer for a specific column (e.g., '1a', '2b')
     */
    private function findAnswerForColumn($column, $answers, $tahapConfig)
    {
        $prefix = substr($column, 0, 1);
        $letter = substr($column, 1);

        if (!isset($tahapConfig[$prefix])) {
            return null;
        }

        $config = $tahapConfig[$prefix];

        // Get questions for this tahap
        $questions = $this->getQuestions($config);
        $questionIdx = ord($letter) - ord('a');

        if (!isset($questions[$questionIdx])) {
            return null;
        }

        $questionId = $questions[$questionIdx]['id'];

        // Find answer
        if ($config['questions_table'] == 'news_questions') {
            return $answers['news_questions'][$questionId] ?? null;
        } elseif ($config['questions_table'] == 'materi_questions') {
            return $answers['materi_questions'][$questionId] ?? null;
        } elseif ($config['questions_table'] == 'preparation_questions') {
            return $answers['preparation_questions'][$questionId] ?? null;
        } elseif ($config['questions_table'] == null) {
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
