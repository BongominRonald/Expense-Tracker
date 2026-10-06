<?php
/**
 * Configuration
 */

// Database
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'student_finance_db');

// App
define('APP_NAME', 'Student Finance Manager');

// Global PHP error behavior: do NOT display HTML errors in responses; log instead
try { @ini_set('display_errors','0'); @ini_set('log_errors','1'); @error_reporting(E_ALL); } catch (Throwable $e) {}

// Session: set cookie params BEFORE starting the session
try {
    $params = session_get_cookie_params();
    session_set_cookie_params([
        'lifetime' => $params['lifetime'],
        'path' => $params['path'],
        'domain' => $params['domain'],
        'secure' => false, // TODO: set to true on HTTPS
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
} catch (Throwable $e) {}
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// Central CORS: allow credentialed same-origin and permissive fallback for file:// -> http during local testing
try {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if ($origin) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
    } else {
        // No Origin header (e.g., file://) — allow wildcard without credentials
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
} catch (Throwable $e) {}
?>
