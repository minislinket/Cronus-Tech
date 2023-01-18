<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');


$data = file_get_contents("php://input");
$data = json_decode($data, true);

$callInfo = isset($data['call']) ? $data['call'] : '';
$nextStatusId = isset($data['nextStatusId']) ? $data['nextStatusId'] : '';
$user = isset($data['user']) ? $data['user'] : '';
$signature = isset($data['signature']) ? $data['signature'] : '';
$time_stamp = isset($data['time_stamp']) ? $data['time_stamp'] : '';


if($callInfo)
{


    $callId = $callInfo['id'];
    $employeeCode = $user['employeeCode'];
    $technician = $user['displayName'];


    try
    {
        $query = "INSERT INTO `tech_status_update_detail`
        (`call_id`, `call_info`, `technician_employee_code`, `technician`, `tech_time_stamp`, `signature`, `next_status_id`) 
        VALUES 
        (:callId, :callInfo, :employeeCode, :technician, :time_stamp, :signature, :nextStatusId)";

        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':callId', $callId);
        $stmt->bindValue(':callInfo', json_encode($callInfo));
        $stmt->bindValue(':employeeCode', $employeeCode);
        $stmt->bindValue(':technician', $technician);
        $stmt->bindValue(':time_stamp', $time_stamp);
        $stmt->bindValue(':signature', $signature);
        $stmt->bindValue(':nextStatusId', $nextStatusId);

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
    $query = "INSERT INTO tech_status_updates (`data`) VALUES (:data)";

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