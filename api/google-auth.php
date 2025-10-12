<?php
require 'vendor/autoload.php';
require 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->credential)) {
    http_response_code(400);
    echo json_encode(['message' => 'Google credential not provided.']);
    exit();
}

$id_token = $data->credential;
require_once 'config.php';
$CLIENT_ID = GOOGLE_CLIENT_ID;

$caCertPath = 'C:/xampp/php/extras/ssl/cacert.pem';

$guzzleClient = new \GuzzleHttp\Client(['verify' => $caCertPath]);

$client = new Google_Client(['client_id' => $CLIENT_ID]);
$client->setHttpClient($guzzleClient);


$payload = $client->verifyIdToken($id_token);

if ($payload) {
    $google_id = $payload['sub'];
    $email = $payload['email'];
    $username = $payload['name'];

    $stmt = $db->prepare("SELECT * FROM users WHERE google_id = ?");
    $stmt->execute([$google_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
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
        try {
            $password_hash = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);

            $stmt = $db->prepare("INSERT INTO users (username, email, google_id, password_hash) VALUES (?, ?, ?, ?)");
            $stmt->execute([$username, $email, $google_id, $password_hash]);
            $user_id = $db->lastInsertId();

            http_response_code(201);
            echo json_encode([
                "message" => "User registered and logged in successfully.",
                "user" => [
                    "id" => $user_id,
                    "username" => $username,
                    "email" => $email
                ]
            ]);
        } catch (PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                http_response_code(409);
                echo json_encode(['message' => 'This email is already registered. Please log in using your password.']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Could not register user.', 'error' => $e->getMessage()]);
            }
        }
    }
} else {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid Google token.']);
}
?>