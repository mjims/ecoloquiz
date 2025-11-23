<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if code column exists, if not add it
        if (!Schema::hasColumn('gifts', 'code')) {
            Schema::table('gifts', function (Blueprint $table) {
                $table->string('code', 10)->nullable()->after('id');
            });
        }

        // Auto-generate codes for existing gifts that don't have one
        $gifts = DB::table('gifts')
            ->whereNull('deleted_at')
            ->where(function($query) {
                $query->whereNull('code')
                      ->orWhere('code', '=', '');
            })
            ->get();
        
        foreach ($gifts as $index => $gift) {
            // Find the next available code number
            $lastCode = DB::table('gifts')
                ->where('code', 'REGEXP', '^C[0-9]+$')
                ->orderByRaw('CAST(SUBSTRING(code, 2) AS UNSIGNED) DESC')
                ->value('code');
            
            $nextNumber = 1;
            if ($lastCode) {
                $nextNumber = intval(substr($lastCode, 1)) + 1;
            }
            
            DB::table('gifts')
                ->where('id', $gift->id)
                ->update(['code' => 'C' . $nextNumber]);
        }

        // Now make it unique and non-nullable if it's not already
        Schema::table('gifts', function (Blueprint $table) {
            $table->string('code', 10)->unique()->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gifts', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
