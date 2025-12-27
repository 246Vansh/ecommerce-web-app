<?php
include '../connect.php';
$user_id = $_GET['user_id'];

$sql = "SELECT c.product_id, c.quantity, p.title, p.price, p.image 
        FROM cart c JOIN products p ON c.product_id = p.id
        WHERE c.user_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i",$user_id);
$stmt->execute();
$result = $stmt->get_result();

$cart = [];
while($row = $result->fetch_assoc()){
    $row['images'] = [$row['image']];
    $cart[] = $row;
}
echo json_encode(["cart"=>$cart]);
?>
