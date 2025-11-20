<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\EmailType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class EmailTemplateController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/email-templates",
     *     tags={"Email Templates"},
     *     summary="Get all email templates",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="List of email templates"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $validated['per_page'] ?? 15;

        $templates = EmailTemplate::with(['creator', 'emailType'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($templates);
    }

    /**
     * @OA\Get(
     *     path="/api/email-templates/{id}",
     *     tags={"Email Templates"},
     *     summary="Get a specific email template",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Template ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Template details"),
     *     @OA\Response(response=404, description="Template not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show($id)
    {
        $template = EmailTemplate::with(['creator', 'revisions', 'emailType'])->findOrFail($id);

        return response()->json(['template' => $template]);
    }

    /**
     * @OA\Post(
     *     path="/api/email-templates",
     *     tags={"Email Templates"},
     *     summary="Create a new email template",
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "subject"},
     *             @OA\Property(property="name", type="string", example="Confirmation inscription"),
     *             @OA\Property(property="type", type="string", example="transactional"),
     *             @OA\Property(property="target_types", type="string", example="JOUEURS"),
     *             @OA\Property(property="subject", type="string", example="Bienvenue sur EcoloQuiz"),
     *             @OA\Property(property="sender_name", type="string"),
     *             @OA\Property(property="sender_email", type="string"),
     *             @OA\Property(property="body_html", type="string"),
     *             @OA\Property(property="body_text", type="string"),
     *             @OA\Property(property="variables_schema", type="object"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Template created successfully"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email_type_id' => 'required|uuid|exists:email_types,id',
            'type' => 'nullable|string|max:50',
            'target_types' => 'nullable|string|in:ENTREPRISES,JOUEURS,TOUS',
            'subject' => 'required|string|max:255',
            'sender_name' => 'nullable|string|max:255',
            'sender_email' => 'nullable|email|max:255',
            'to' => 'nullable|string|max:255',
            'cc' => 'nullable|string|max:255',
            'bcc' => 'nullable|string|max:255',
            'body_html' => 'nullable|string',
            'body_text' => 'nullable|string',
            'variables_schema' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        // Vérifier l'unicité uniquement pour les types système
        $emailType = EmailType::find($request->email_type_id);
        if ($emailType && $emailType->is_system) {
            $existingTemplate = EmailTemplate::where('email_type_id', $request->email_type_id)->first();
            if ($existingTemplate) {
                return response()->json([
                    'error' => 'Un template existe déjà pour ce type d\'email système. Les types système ne peuvent avoir qu\'un seul template.',
                ], 422);
            }
        }

        $data = $validator->validated();

        // Generate unique code from name
        $data['code'] = Str::slug($data['name']);

        // Add created_by
        $data['created_by'] = auth()->id();

        $template = EmailTemplate::create($data);
        $template->load(['creator', 'emailType']);

        return response()->json([
            'template' => $template,
            'message' => 'Email template created successfully',
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/api/email-templates/{id}",
     *     tags={"Email Templates"},
     *     summary="Update an email template",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Template ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="type", type="string"),
     *             @OA\Property(property="target_types", type="string"),
     *             @OA\Property(property="subject", type="string"),
     *             @OA\Property(property="sender_name", type="string"),
     *             @OA\Property(property="sender_email", type="string"),
     *             @OA\Property(property="body_html", type="string"),
     *             @OA\Property(property="body_text", type="string"),
     *             @OA\Property(property="variables_schema", type="object"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Template updated successfully"),
     *     @OA\Response(response=404, description="Template not found"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function update(Request $request, $id)
    {
        $template = EmailTemplate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email_type_id' => 'sometimes|required|uuid|exists:email_types,id',
            'type' => 'nullable|string|max:50',
            'target_types' => 'nullable|string|in:ENTREPRISES,JOUEURS,TOUS',
            'subject' => 'sometimes|required|string|max:255',
            'sender_name' => 'nullable|string|max:255',
            'sender_email' => 'nullable|email|max:255',
            'to' => 'nullable|string|max:255',
            'cc' => 'nullable|string|max:255',
            'bcc' => 'nullable|string|max:255',
            'body_html' => 'nullable|string',
            'body_text' => 'nullable|string',
            'variables_schema' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation error',
                'messages' => $validator->errors(),
            ], 422);
        }

        // Si le type d'email change, vérifier l'unicité pour les types système
        if ($request->has('email_type_id') && $request->email_type_id !== $template->email_type_id) {
            $emailType = EmailType::find($request->email_type_id);
            if ($emailType && $emailType->is_system) {
                $existingTemplate = EmailTemplate::where('email_type_id', $request->email_type_id)
                    ->where('id', '!=', $id)
                    ->first();
                if ($existingTemplate) {
                    return response()->json([
                        'error' => 'Un template existe déjà pour ce type d\'email système. Les types système ne peuvent avoir qu\'un seul template.',
                    ], 422);
                }
            }
        }

        $data = $validator->validated();

        // Update code if name changed
        if (isset($data['name']) && $data['name'] !== $template->name) {
            $data['code'] = Str::slug($data['name']);
        }

        $template->update($data);
        $template->load(['creator', 'emailType']);

        return response()->json([
            'template' => $template,
            'message' => 'Email template updated successfully',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/email-templates/{id}",
     *     tags={"Email Templates"},
     *     summary="Delete an email template",
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Template ID",
     *         required=true,
     *         @OA\Schema(type="string", format="uuid")
     *     ),
     *     @OA\Response(response=200, description="Template deleted successfully"),
     *     @OA\Response(response=404, description="Template not found"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function destroy($id)
    {
        $template = EmailTemplate::findOrFail($id);
        $template->delete();

        return response()->json([
            'message' => 'Email template deleted successfully',
        ]);
    }
}
