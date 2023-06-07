<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');
$data = file_get_contents("php://input");
$data = json_decode($data, true);

// echo $technician;


$call_id = isset($data['call_id']) ? $data['call_id'] : '';
$technician = isset($data['employee_code']) ? $data['employee_code'] : '';
$status = isset($data['status']) ? $data['status'] : 'deleted admin';

try {

    $query = "UPDATE `required_doc_removal`
    SET `status` = :status
    
    where `technician_employee_code` = :technician and `call_id` = :call_id";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':technician', $technician);
    $stmt->bindValue(':call_id', $call_id);
    $stmt->bindValue(':status', $status);

    $stmt->execute();
    $lastInsertedId = $pdo->lastInsertId();

    echo $lastInsertedId;
}
catch(PDOException $e) 
{
    die($e->getMessage());
}






?>