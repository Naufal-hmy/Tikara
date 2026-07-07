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

        // Alter the columns to VARCHAR(36) in PostgreSQL
        DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN subject_id TYPE varchar(36) USING subject_id::text');
        DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN causer_id TYPE varchar(36) USING causer_id::text');
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

        // We converted from uuid to varchar. Reversing it back to uuid:
        // DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN subject_id TYPE uuid USING subject_id::uuid');
        // DB::statement('ALTER TABLE ' . $tableNames['activity_log'] . ' ALTER COLUMN causer_id TYPE uuid USING causer_id::uuid');
    }
};
