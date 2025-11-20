<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

/**
 * @OA\Info(
 *     title="EcoloQuiz API",
 *     description="API endpoints for EcoloQuiz - Quiz and Player Management System",
 *     version="1.0.0"
 * )
 *
 * @OA\SecurityScheme(
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="token",
 *     description="Enter JWT Bearer token"
 * )
 *
 * @OA\Server(
 *     url="/",
 *     description="API Server"
 * )
 */
abstract class Controller {}
