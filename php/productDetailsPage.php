<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'connect.php';

if (!isset($_GET['id'])) {
    echo json_encode(["status" => "error", "message" => "No product ID provided"]);
    exit;
}

$product_id = intval($_GET['id']);

$sql = "SELECT * FROM products WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $product = $result->fetch_assoc();

    $product['image'] = !empty($product['image'])
        ? explode(',', $product['image'])
        : [$product['image']];

    echo json_encode(["status" => "success", "data" => $product]);
} else {
    echo json_encode(["status" => "error", "message" => "Product not found"]);
}

$stmt->close();
$conn->close();
?>
