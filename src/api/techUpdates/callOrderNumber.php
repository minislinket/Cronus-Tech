<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');


$data = file_get_contents("php://input");
$data = json_decode($data, true);

$callInfo = isset($data['call']) ? $data['call'] : '';
$orderNumber = isset($data['orderNumber']) ? $data['orderNumber'] : '';
$user = isset($data['user']) ? $data['user'] : '';





$callId = $callInfo['id'];
$employeeCode = $user['employeeCode'];

try
{
    $query = "INSERT INTO `tech_order_number`
    (`call_id`, `order_number`, `technician_employee_code`) 
    VALUES 
    (:callId, :orderNumber, :employeeCode)";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':callId', $callId);
    $stmt->bindValue(':orderNumber', $orderNumber);
    $stmt->bindValue(':employeeCode', $employeeCode);

    $stmt->execute();
    $lastInsertedId = $pdo->lastInsertId();
}


catch(PDOException $e)
{
    die($e->getMessage());
}





?>