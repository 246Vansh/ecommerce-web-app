<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include './connect.php';

$user_id = $_POST['user_id'] ?? null;
$shipping = $_POST['shipping'] ?? 'standard';

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit;
}

try {
    // 1️⃣ Get cart items
    $stmt = $conn->prepare("SELECT * FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $cartResult = $stmt->get_result();
    $cartItems = $cartResult->fetch_all(MYSQLI_ASSOC);

    if (!$cartItems) {
        echo json_encode(["status" => "error", "message" => "Cart is empty"]);
        exit;
    }

    // 2️⃣ Calculate total
    $total = 0;
    foreach ($cartItems as $item) {
        $total += $item['price'] * $item['quantity'];
    }
    $shippingCharge = $shipping === 'fast' ? 16 : ($total > 100 ? 0 : ($total > 0 ? 5 : 0));
    $total += $shippingCharge;

    // 3️⃣ Insert into orders table
    $stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, shipping_method) VALUES (?, ?, ?)");
    $stmt->bind_param("ids", $user_id, $total, $shipping);
    $stmt->execute();
    $order_id = $stmt->insert_id;

    // 4️⃣ Insert each cart item into order_items
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($cartItems as $item) {
        $stmt->bind_param("iiid", $order_id, $item['product_id'], $item['quantity'], $item['price']);
        $stmt->execute();
    }

    // 5️⃣ Clear cart
    $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Order placed successfully", "order_id" => $order_id]);
    $conn->close();

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
