<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnswerOption;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    /**
     * Get paginated list of questions
     *
     * @OA\Get(
     *   path="/api/questions",
     *   tags={"Questions"},
     *   summary="Get paginated list of questions",
     *   description="Returns a paginated list of all questions with statistics",
     *   security={{"token":{}}},
     *
     *   @OA\Parameter(
     *     name="page",
     *     in="query",
     *     description="Page number",
     *     required=false,
     *     @OA\Schema(type="integer", example=1)
     *   ),
     *
     *   @OA\Parameter(
     *     name="per_page",
     *     in="query",
     *     description="Number of items per page (max 100)",
     *     required=false,
     *     @OA\Schema(type="integer", example=15)
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Questions retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="current_page", type="integer", example=1),
     *       @OA\Property(property="data", type="array",
     *         @OA\Items(
     *           @OA\Property(property="id", type="string", format="uuid"),
     *           @OA\Property(property="quiz_id", type="string", format="uuid"),
     *           @OA\Property(property="text", type="string", example="Le plastique est-il 100% recyclable ?"),
     *           @OA\Property(property="type", type="string", example="MULTIPLE_CHOICE"),
     *           @OA\Property(property="explanation", type="string"),
     *           @OA\Property(property="image_url", type="string", nullable=true),
     *           @OA\Property(property="success_rate", type="integer", example=87),
     *           @OA\Property(property="created_at", type="string", format="date-time"),
     *           @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *       ),
     *       @OA\Property(property="total", type="integer", example=67)
     *     )
     *   ),
     *
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $validated['per_page'] ?? 15;

        $questions = Question::with(['quiz.theme', 'quiz.level'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($questions);
    }

    /**
     * Get a specific question by ID
     *
     * @OA\Get(
     *   path="/api/questions/{id}",
     *   tags={"Questions"},
     *   summary="Get a specific question",
     *   description="Returns detailed information about a specific question",
     *   security={{"token":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="Question ID",
     *     required=true,
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Question retrieved successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="question", type="object")
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Question not found"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $question = Question::with(['quiz.theme', 'quiz.level', 'options'])->findOrFail($id);

        return response()->json(['question' => $question]);
    }

    /**
     * Create a new question
     *
     * @OA\Post(
     *   path="/api/questions",
     *   tags={"Questions"},
     *   summary="Create a new question",
     *   description="Create a new question for a quiz with answer options",
     *   security={{"token":{}}},
     *
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"quiz_id", "text", "type", "options"},
     *       @OA\Property(property="quiz_id", type="string", format="uuid"),
     *       @OA\Property(property="text", type="string", example="Le plastique est-il 100% recyclable ?"),
     *       @OA\Property(property="type", type="string", example="QCM", description="QCM or VRAI_FAUX"),
     *       @OA\Property(property="explanation", type="string"),
     *       @OA\Property(property="image_url", type="string", nullable=true),
     *       @OA\Property(
     *         property="options",
     *         type="array",
     *         @OA\Items(
     *           @OA\Property(property="text", type="string", example="Oui"),
     *           @OA\Property(property="is_correct", type="boolean", example=false),
     *           @OA\Property(property="extra", type="string", nullable=true)
     *         )
     *       )
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=201,
     *     description="Question created successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="question", type="object"),
     *       @OA\Property(property="message", type="string", example="Question created successfully")
     *     )
     *   ),
     *
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'quiz_id' => 'required|uuid|exists:quizzes,id',
            'text' => 'required|string|max:500',
            'type' => 'required|string|in:QCM,VRAI_FAUX',
            'explanation' => 'nullable|string',
            'image_url' => 'nullable|url',
            'options' => 'required|array|min:1',
            'options.*.text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
            'options.*.extra' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Create the question
            $question = Question::create([
                'quiz_id' => $validated['quiz_id'],
                'text' => $validated['text'],
                'type' => $validated['type'],
                'explanation' => $validated['explanation'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
            ]);

            // Create answer options
            foreach ($validated['options'] as $option) {
                AnswerOption::create([
                    'question_id' => $question->id,
                    'text' => $option['text'],
                    'is_correct' => $option['is_correct'],
                    'extra' => $option['extra'] ?? null,
                ]);
            }

            DB::commit();

            // Load relationships
            $question->load(['quiz.theme', 'quiz.level', 'options']);

            return response()->json([
                'question' => $question,
                'message' => 'Question created successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Failed to create question: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a question
     *
     * @OA\Put(
     *   path="/api/questions/{id}",
     *   tags={"Questions"},
     *   summary="Update a question",
     *   description="Update an existing question",
     *   security={{"token":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="Question ID",
     *     required=true,
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       @OA\Property(property="text", type="string"),
     *       @OA\Property(property="type", type="string"),
     *       @OA\Property(property="explanation", type="string"),
     *       @OA\Property(property="image_url", type="string", nullable=true)
     *     )
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Question updated successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="question", type="object"),
     *       @OA\Property(property="message", type="string", example="Question updated successfully")
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Question not found"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);

        $validated = $request->validate([
            'text' => 'sometimes|required|string|max:500',
            'type' => 'sometimes|required|string|in:QCM,VRAI_FAUX',
            'explanation' => 'nullable|string',
            'image_url' => 'nullable|url',
            'options' => 'sometimes|array|min:1',
            'options.*.text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
            'options.*.extra' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Update question fields
            $question->update([
                'text' => $validated['text'] ?? $question->text,
                'type' => $validated['type'] ?? $question->type,
                'explanation' => $validated['explanation'] ?? $question->explanation,
                'image_url' => $validated['image_url'] ?? $question->image_url,
            ]);

            // Update options if provided
            if (isset($validated['options'])) {
                // Delete existing options
                AnswerOption::where('question_id', $question->id)->delete();

                // Create new options
                foreach ($validated['options'] as $option) {
                    AnswerOption::create([
                        'question_id' => $question->id,
                        'text' => $option['text'],
                        'is_correct' => $option['is_correct'],
                        'extra' => $option['extra'] ?? null,
                    ]);
                }
            }

            DB::commit();

            // Load relationships
            $question->load(['quiz.theme', 'quiz.level', 'options']);

            return response()->json([
                'question' => $question,
                'message' => 'Question updated successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Failed to update question: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a question
     *
     * @OA\Delete(
     *   path="/api/questions/{id}",
     *   tags={"Questions"},
     *   summary="Delete a question",
     *   description="Soft delete a question",
     *   security={{"token":{}}},
     *
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     description="Question ID",
     *     required=true,
     *     @OA\Schema(type="string", format="uuid")
     *   ),
     *
     *   @OA\Response(
     *     response=200,
     *     description="Question deleted successfully",
     *     @OA\JsonContent(
     *       @OA\Property(property="message", type="string", example="Question deleted successfully")
     *     )
     *   ),
     *
     *   @OA\Response(response=404, description="Question not found"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $question = Question::findOrFail($id);
        $question->delete();

        return response()->json([
            'message' => 'Question deleted successfully',
        ]);
    }
}
