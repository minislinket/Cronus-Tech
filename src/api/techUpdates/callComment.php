<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');


$data = file_get_contents("php://input");
$data = json_decode($data, true);

$callInfo = isset($data['call']) ? $data['call'] : '';
$comment = isset($data['comment']) ? $data['comment'] : '';
$user = isset($data['user']) ? $data['user'] : '';


if($callInfo)
{


    $callId = $callInfo['id'];
    $employeeCode = $user['employeeCode'];
    $commentData = isset($comment['comment']) ? json_encode($comment['comment']) : $comment;

    try
    {
        $query = "INSERT INTO `tech_call_comment`
        (`call_id`, `comment`, `technician_employee_code`) 
        VALUES 
        (:callId, :comment, :employeeCode)";

        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':callId', $callId);
        $stmt->bindValue(':comment', $commentData);
        $stmt->bindValue(':employeeCode', $employeeCode);

        $stmt->execute();
        $lastInsertedId = $pdo->lastInsertId();
    }


    catch(PDOException $e)
    {
        die($e->getMessage());
    }

}



try
{
    $query = "INSERT INTO tech_call_comment_raw (`data`) VALUES (:data)";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':data', json_encode($data));

    $stmt->execute();
    $lastInsertedId = $pdo->lastInsertId();
    echo $lastInsertedId;
}


catch(PDOException $e)
{
    die($e->getMessage());
}



?>