import * as XLSX from 'xlsx';

/**
 * Generate and download question template Excel file
 */
export function downloadQuestionTemplate(type: 'questions' | 'unified' = 'questions') {
    const workbook = XLSX.utils.book_new();

    if (type === 'unified') {
        // Unified template (themes + questions)
        const headers = [
            'theme_title', 'theme_description', 'theme_image_url',
            'level_order',
            'question_text', 'question_type', 'question_explanation', 'question_image_url',
            'option_1_text', 'option_1_correct',
            'option_2_text', 'option_2_correct',
            'option_3_text', 'option_3_correct',
            'option_4_text', 'option_4_correct',
        ];

        const exampleData = [
            [
                'Recyclage', 'Questions sur le recyclage', '',
                1,
                'Le plastique est-il 100% recyclable ?', 'QCM', 'Tous les plastiques ne sont pas recyclables', '',
                'Oui, totalement', 'false',
                'Partiellement', 'true',
                'Non', 'false',
                '', ''
            ]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
        XLSX.writeFile(workbook, 'template_questions_unified.xlsx');
    } else {
        // Questions only template
        const headers = [
            'quiz_id',
            'question_text', 'question_type', 'question_explanation', 'question_image_url',
            'option_1_text', 'option_1_correct',
            'option_2_text', 'option_2_correct',
            'option_3_text', 'option_3_correct',
            'option_4_text', 'option_4_correct',
        ];

        const exampleData = [
            [
                'PASTE_QUIZ_ID_HERE',
                'Question example', 'QCM', 'Explanation here', '',
                'Option 1', 'false',
                'Option 2', 'true',
                'Option 3', 'false',
                '', ''
            ]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
        XLSX.writeFile(workbook, 'template_questions.xlsx');
    }
}

/**
 * Generate and download theme template Excel file
 */
export function downloadThemeTemplate() {
    const workbook = XLSX.utils.book_new();

    const headers = ['title', 'description', 'image_url'];
    const exampleData = [
        ['Recyclage', 'Questions sur le recyclage et l\'environnement', 'https://example.com/recyclage.jpg'],
        ['Économie d\'énergie', 'Conseils pour économiser l\'énergie', ''],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Themes');
    XLSX.writeFile(workbook, 'template_themes.xlsx');
}
