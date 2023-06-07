<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');
$technician = file_get_contents("php://input");
// echo $technician;

try {

    $query = "SELECT * from `required_doc_removal` where `technician_employee_code` = :technician and `status` = :status";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':technician', $technician);
    $stmt->bindValue(':status', 'can delete');

    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result);
}
catch(PDOException $e) 
{
    die($e->getMessage());
}






?>