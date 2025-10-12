<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password) || !isset($data->username)) {
    http_response_code(400);
    echo json_encode(["message" => "Please provide all required fields."]);
    exit();
}

$username = $data->username;
$email = $data->email;
$password = $data->password;

if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["message" => "Fields cannot be empty."]);
    exit();
}

// Проверка, существует ли email
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409); 
    echo json_encode(["message" => "User with this email already exists."]);
    exit();
}

// Хешируем пароль
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// Вставляем нового пользователя
try {
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $password_hash]);

    http_response_code(201); // 201 Created
    echo json_encode(["message" => "User was successfully registered."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Unable to register the user.", "error" => $e->getMessage()]);
}
?>