<?php
header("Content-Type: application/json");

include 'connect.php';

// Step 1: Fetch from DummyJSON API
$dummyJson = file_get_contents("https://dummyjson.com/products");
$data = json_decode($dummyJson, true);

if (!isset($data["products"])) {
    die(json_encode(["status" => "error", "message" => "No products found in DummyJSON"]));
}

$products = $data["products"];

// Step 2: Insert into your products table
$inserted = 0;
foreach ($products as $product) {
    $title = $conn->real_escape_string($product["title"]);
    $description = $conn->real_escape_string($product["description"]);
    $price = (float)$product["price"];
    $rating = (float)$product["rating"];
    $category = $conn->real_escape_string($product["category"]);
    $image = $conn->real_escape_string($product["thumbnail"]); // use main thumbnail

    $sql = "INSERT INTO products (title, description, price, rating, category, image)
            VALUES ('$title', '$description', $price, $rating, '$category', '$image')";
    
    if ($conn->query($sql)) {
        $inserted++;
    }
}

echo json_encode([
    "status" => "success",
    "message" => "$inserted products inserted successfully!"
]);

$conn->close();
?>
