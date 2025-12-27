<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include '../connect.php';

// Enable errors while debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!isset($_POST['user_id'], $_POST['product_id'], $_POST['quantity'])) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$user_id = intval($_POST['user_id']);
$product_id = intval($_POST['product_id']);
$quantity = intval($_POST['quantity']);

// Check if already in cart
$checkSql = "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?";
$stmt = $conn->prepare($checkSql);
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "SQL prepare failed"]);
    exit;
}
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $newQuantity = $row['quantity'] + $quantity;

    $updateSql = "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("ii", $newQuantity, $row['id']);

    if ($updateStmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Cart updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update cart"]);
    }

    $updateStmt->close();
} else {
    $insertSql = "INSERT INTO cart (user_id, product_id, quantity, created_at, updated_at)
                  VALUES (?, ?, ?, NOW(), NOW())";
    $insertStmt = $conn->prepare($insertSql);
    $insertStmt->bind_param("iii", $user_id, $product_id, $quantity);

    if ($insertStmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Product added to cart"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to insert product"]);
    }

    $insertStmt->close();
}

$stmt->close();
$conn->close();
exit;
?>
