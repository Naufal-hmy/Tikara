<?php
$host = 'aws-0-ap-southeast-1.pooler.supabase.com';
$db = 'postgres';
$user = 'postgres.jknlvnvdlzxsxllrtpze';
$pass = 'TikaraUndira';

// Test port 6543
try {
    $dsn = "pgsql:host=$host;port=6543;dbname=$db;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "Port 6543: SUCCESS\n";
} catch (PDOException $e) {
    echo "Port 6543: FAILED - " . $e->getMessage() . "\n";
}

// Test port 5432
try {
    $dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "Port 5432: SUCCESS\n";
} catch (PDOException $e) {
    echo "Port 5432: FAILED - " . $e->getMessage() . "\n";
}
