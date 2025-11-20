<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/upload/image",
     *     tags={"Upload"},
     *     summary="Upload an image",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="image",
     *                     type="string",
     *                     format="binary",
     *                     description="Image file to upload"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Image uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="url", type="string", example="http://localhost:8000/storage/questions/abc123.jpg"),
     *             @OA\Property(property="message", type="string", example="Image uploaded successfully")
     *         )
     *     ),
     *     @OA\Response(response=400, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');

            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

            // Store in public/storage/questions
            $path = $file->storeAs('questions', $filename, 'public');

            // Return the full public URL
            $url = url('storage/' . $path);

            return response()->json([
                'url' => $url,
                'message' => 'Image uploaded successfully',
            ]);
        }

        return response()->json([
            'error' => 'No image file provided',
        ], 400);
    }
}
