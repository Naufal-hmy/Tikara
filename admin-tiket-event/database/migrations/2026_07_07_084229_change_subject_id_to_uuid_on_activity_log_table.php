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
        $tableNames = config('activitylog.table_names');

        if (empty($tableNames)) {
            $tableNames = ['activity_log' => 'activity_log'];
        }

        // Alter the columns to UUID in PostgreSQL
        DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN subject_id TYPE uuid USING subject_id::text::uuid');
        DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN causer_id TYPE uuid USING causer_id::text::uuid');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('activitylog.table_names');

        if (empty($tableNames)) {
            $tableNames = ['activity_log' => 'activity_log'];
        }

        // Attempting to reverse back to bigint might fail if UUIDs contain non-integer values, 
        // but for completeness here is the reverse statement:
        // DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN subject_id TYPE bigint USING subject_id::text::bigint');
        // DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN causer_id TYPE bigint USING causer_id::text::bigint');
    }
};
