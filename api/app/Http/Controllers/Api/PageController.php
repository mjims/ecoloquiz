<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/pages",
     *     tags={"Pages"},
     *     summary="Get all pages",
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
     *         name="type",
     *         in="query",
     *         description="Filter by page type",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Response(response=200, description="List of pages"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);

        $query = Page::with('author:id,first_name,last_name,email');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by title
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('long_title', 'LIKE', "%{$search}%")
                  ->orWhere('subtitle', 'LIKE', "%{$search}%");
            });
        }

        $pages = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($pages);
    }

    /**
     * @OA\Get(
     *     path="/api/pages/{id}",
     *     tags={"Pages"},
     *     summary="Get a specific page",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Page ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Page details"),
     *     @OA\Response(response=404, description="Page not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $page = Page::with('author:id,first_name,last_name,email')->findOrFail($id);
        return response()->json($page);
    }

    /**
     * @OA\Post(
     *     path="/api/pages",
     *     tags={"Pages"},
     *     summary="Create a new page",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "type"},
     *             @OA\Property(property="type", type="string", example="BLOG"),
     *             @OA\Property(property="title", type="string", example="Conseil en recyclage de carton"),
     *             @OA\Property(property="long_title", type="string", example="Guide complet du recyclage de carton"),
     *             @OA\Property(property="subtitle", type="string", example="Apprenez les bonnes pratiques"),
     *             @OA\Property(property="summary", type="string", example="Un résumé de la page"),
     *             @OA\Property(property="content_html", type="string", example="<p>Contenu de la page...</p>"),
     *             @OA\Property(property="image_url", type="string", example="https://example.com/image.jpg"),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="published_at", type="string", format="date-time", example="2025-01-04 10:00:00")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Page created successfully"),
     *     @OA\Response(response=400, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:BLOG,INFO,QUIZ_PAGE',
            'title' => 'required|string|max:255',
            'long_title' => 'nullable|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'summary' => 'nullable|string',
            'content_html' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $data = $validator->validated();

        // Generate slug from title
        $data['slug'] = Str::slug($data['title']);

        // Add author
        $data['author_id'] = auth()->id();

        // Set default is_active if not provided
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $page = Page::create($data);

        return response()->json($page->load('author:id,first_name,last_name,email'), 201);
    }

    /**
     * @OA\Put(
     *     path="/api/pages/{id}",
     *     tags={"Pages"},
     *     summary="Update a page",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Page ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="type", type="string"),
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="long_title", type="string"),
     *             @OA\Property(property="subtitle", type="string"),
     *             @OA\Property(property="summary", type="string"),
     *             @OA\Property(property="content_html", type="string"),
     *             @OA\Property(property="image_url", type="string"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="published_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Page updated successfully"),
     *     @OA\Response(response=400, description="Validation error"),
     *     @OA\Response(response=404, description="Page not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|required|string|in:BLOG,INFO,QUIZ_PAGE',
            'title' => 'sometimes|required|string|max:255',
            'long_title' => 'nullable|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'summary' => 'nullable|string',
            'content_html' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $data = $validator->validated();

        // Update slug if title changes
        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $page->update($data);

        return response()->json($page->load('author:id,first_name,last_name,email'));
    }

    /**
     * @OA\Delete(
     *     path="/api/pages/{id}",
     *     tags={"Pages"},
     *     summary="Delete a page (soft delete)",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Page ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Page deleted successfully"),
     *     @OA\Response(response=404, description="Page not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json(['message' => 'Page deleted successfully']);
    }
}
