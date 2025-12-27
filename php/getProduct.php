<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'connect.php';

$sql = "SELECT id, title, description, price, rating, category, image FROM products";
$result = $conn->query($sql);

$products = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = [
            "id" => (int)$row["id"],
            "title" => $row["title"],
            "description" => $row["description"],
            "price" => (float)$row["price"],
            "rating" => (float)$row["rating"],
            "category" => $row["category"],
            "images" => [$row["image"]]
        ];
    }
    echo json_encode(["status" => "success", "products" => $products]);
} else {
    echo json_encode(["status" => "error", "products" => [], "message" => "No products found"]);
}

$conn->close();
?>
