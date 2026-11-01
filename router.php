<?php
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$root = __DIR__;

if (strpos($uri, '/api') === 0) {
    require $root . '/api/index.php';
    return;
}

if ($uri === '/' || $uri === '') {
    $file = $root . '/index.html';
    if (is_file($file)) {
        require $file;
        return;
    }
}

$requested = $root . $uri;
if (is_file($requested)) {
    return false;
}

if (is_file($root . '/index.html')) {
    require $root . '/index.html';
    return;
}

http_response_code(404);
echo 'Not Found';
