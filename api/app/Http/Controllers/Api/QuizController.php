<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuizController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/quizzes",
     *     tags={"Quizzes"},
     *     summary="Get all quizzes",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="theme_id",
     *         in="query",
     *         description="Filter by theme ID",
     *         required=false,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="List of quizzes"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $themeId = $request->input('theme_id');

        $query = Quiz::with(['theme', 'level', 'questions']);

        if ($themeId) {
            $query->where('theme_id', $themeId);
        }

        $quizzes = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($quizzes);
    }

    /**
     * @OA\Get(
     *     path="/api/quizzes/{id}",
     *     tags={"Quizzes"},
     *     summary="Get a specific quiz",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Quiz ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Quiz details"),
     *     @OA\Response(response=404, description="Quiz not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $quiz = Quiz::with(['theme', 'level', 'questions'])->findOrFail($id);
        return response()->json($quiz);
    }

    /**
     * @OA\Post(
     *     path="/api/quizzes",
     *     tags={"Quizzes"},
     *     summary="Create a new quiz",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "theme_id", "level_id"},
     *             @OA\Property(property="title", type="string", example="Quiz Déchet Niveau 1"),
     *             @OA\Property(property="theme_id", type="string", format="uuid"),
     *             @OA\Property(property="level_id", type="integer", example=1),
     *             @OA\Property(property="max_score", type="integer", example=100)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Quiz created successfully"),
     *     @OA\Response(response=400, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'theme_id' => 'required|uuid|exists:themes,id',
            'level_id' => 'required|integer|exists:levels,id',
            'max_score' => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $quiz = Quiz::create($validator->validated());
        $quiz->load(['theme', 'level']);

        return response()->json($quiz, 201);
    }

    /**
     * @OA\Put(
     *     path="/api/quizzes/{id}",
     *     tags={"Quizzes"},
     *     summary="Update a quiz",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Quiz ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="theme_id", type="string", format="uuid"),
     *             @OA\Property(property="level_id", type="integer"),
     *             @OA\Property(property="max_score", type="integer")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Quiz updated successfully"),
     *     @OA\Response(response=400, description="Validation error"),
     *     @OA\Response(response=404, description="Quiz not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'theme_id' => 'sometimes|required|uuid|exists:themes,id',
            'level_id' => 'sometimes|required|integer|exists:levels,id',
            'max_score' => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $quiz->update($validator->validated());
        $quiz->load(['theme', 'level']);

        return response()->json($quiz);
    }

    /**
     * @OA\Delete(
     *     path="/api/quizzes/{id}",
     *     tags={"Quizzes"},
     *     summary="Delete a quiz (soft delete)",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Quiz ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Quiz deleted successfully"),
     *     @OA\Response(response=404, description="Quiz not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted successfully']);
    }
}
