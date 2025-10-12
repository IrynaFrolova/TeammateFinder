<?php
require 'db.php';
session_start(); 

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Please provide both email and password."]);
    exit();
}

$email = $data->email;
$password = $data->password;

// Ищем пользователя по email
$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    if (password_verify($password, $user['password_hash'])) {
        // Пароль верный
        http_response_code(200);
        echo json_encode([
            "message" => "Login successful.",
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email']
            ]
        ]);
    } else {
        // Пароль неверный
        http_response_code(401);
        echo json_encode(["message" => "Invalid credentials."]);
    }
} else {
    // Пользователь с таким email не найден
    http_response_code(401);
    echo json_encode(["message" => "Invalid credentials."]);
}
?>