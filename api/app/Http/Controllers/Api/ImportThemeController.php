<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportThemeController extends Controller
{
    /**
     * Download theme template Excel file
     */
    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['title', 'description', 'image_url'];
        $sheet->fromArray($headers, null, 'A1');

        // Example data
        $sheet->fromArray(['Recyclage', 'Questions sur le recyclage et l\'environnement', 'https://example.com/recyclage.jpg'], null, 'A2');
        $sheet->fromArray(['Économie d\'énergie', 'Conseils pour économiser l\'énergie', ''], null, 'A3');

        // Style header row
        $sheet->getStyle('A1:C1')->getFont()->setBold(true);

        $writer = new Xlsx($spreadsheet);
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="template_themes.xlsx"');
        header('Cache-Control: max-age=0');
        
        $writer->save('php://output');
        exit;
    }

    /**
     * Validate imported theme file
     */
    public function validateImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:10240',
        ]);

        $file = $request->file('file');

        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Remove header row
            array_shift($rows);
            
            $preview = [];
            $errors = [];

            foreach ($rows as $index => $row) {
                $lineNumber = $index + 2;

                if (empty(array_filter($row))) {
                    continue; // Skip empty rows
                }

                $title = trim($row[0] ?? '');
                
                if (empty($title)) {
                    $errors[] = "Ligne $lineNumber : title requis";
                    continue;
                }

                $preview[] = [
                    'title' => $title,
                    'description' => trim($row[1] ?? ''),
                    'image_url' => trim($row[2] ?? ''),
                ];
            }

            return response()->json([
                'success' => count($errors) === 0,
                'preview' => $preview,
                'errors' => $errors,
                'total_themes' => count($preview),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la lecture du fichier : ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Execute theme import
     */
    public function executeImport(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
        ]);

        $data = $request->input('data');

        DB::beginTransaction();

        try {
            $created = 0;
            $updated = 0;

            foreach ($data as $themeData) {
                $theme = Theme::where('title', $themeData['title'])->first();

                if ($theme) {
                    $theme->update([
                        'description' => $themeData['description'] ?? null,
                        'image_url' => $themeData['image_url'] ?? null,
                    ]);
                    $updated++;
                } else {
                    Theme::create([
                        'id' => Str::uuid(),
                        'title' => $themeData['title'],
                        'description' => $themeData['description'] ?? null,
                        'image_url' => $themeData['image_url'] ?? null,
                    ]);
                    $created++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Importation réussie',
                'stats' => [
                    'created' => $created,
                    'updated' => $updated,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'importation : ' . $e->getMessage(),
            ], 500);
        }
    }
}
