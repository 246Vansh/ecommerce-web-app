<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost"); // adjust domain if needed
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["loggedIn" => false, "message" => "Invalid request method"]);
    exit;
}

if (isset($_SESSION['user']) && !empty($_SESSION['user']['id'])) {
    echo json_encode([
        "loggedIn" => true,
        "user" => [
            "id" => $_SESSION['user']['id'],
            "username" => $_SESSION['user']['username'] ?? "Guest",
            "email" => $_SESSION['user']['email']
        ]
    ]);
} else {
    echo json_encode(["loggedIn" => false, "message" => "No active session"]);
}
?>
