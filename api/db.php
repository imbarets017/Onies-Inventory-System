<?php

function loadEnvironmentFile(): void
{
    $candidateFiles = [
        dirname(__DIR__) . '/.env',
        __DIR__ . '/.env',
    ];

    foreach ($candidateFiles as $filePath) {
        if (!is_file($filePath)) {
            continue;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if ($lines === false) {
            continue;
        }

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($trimmed === '' || $trimmed[0] === '#') {
                continue;
            }

            $parts = explode('=', $trimmed, 2);

            if (count($parts) !== 2) {
                continue;
            }

            [$key, $value] = $parts;
            $key = trim($key);
            $value = trim($value);

            if (preg_match('/^(".*"|\'.*\')$/', $value) === 1) {
                $value = substr($value, 1, -1);
            }

            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
            putenv($key . '=' . $value);
        }

        break;
    }
}

loadEnvironmentFile();

function getDatabaseConfigValue(string $key, string $default = ''): string
{
    $value = getenv($key);

    if ($value === false || $value === '') {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? $default;
    }

    return $value === false ? $default : (string) $value;
}

function getDatabaseConnection(): PDO
{
    $host = getDatabaseConfigValue('DB_HOST', '127.0.0.1');
    $port = getDatabaseConfigValue('DB_PORT', '3306');
    $dbname = getDatabaseConfigValue('DB_NAME', 'slipper_inventory');
    $user = getDatabaseConfigValue('DB_USER', 'root');
    $password = getDatabaseConfigValue('DB_PASS', '');

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbname);

    try {
        $pdo = new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return $pdo;
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed.',
            'error' => $exception->getMessage(),
        ], JSON_THROW_ON_ERROR);
        exit;
    }
}
