<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');


$data = file_get_contents("php://input");
$data = json_decode($data, true);

// echo json_encode($data);

$call_id = isset($data['call_id']) ? $data['call_id'] : '';
$status = isset($data['status']) ? $data['status'] : 'deleted';

$doc_added = isset($data['doc_added']) ? $data['doc_added'] : '';
$user = isset($data['employee_code']) ? $data['employee_code'] : '';
$id = isset($data['id']) ? $data['id'] : '';

$db_id = $id.'_'.$user.'_'.$doc_added;




try 
{
    $query = "UPDATE `doc_uploads_log` SET  
    `upload_status` = :status 
    WHERE `db_id` = :db_id and `call_id` = :call_id";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':call_id', $call_id);
    $stmt->bindValue(':db_id', $db_id);
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