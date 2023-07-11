<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');


$data = file_get_contents("php://input");
$data = json_decode($data, true);


$firebase_mobile_registration_token = isset($data['firebaseToken']) ? $data['firebaseToken'] : '';
$user_agent_browser = isset($data['userAgent']) ? $data['userAgent'] : ''; 
$employee_code = isset($data['employeeCode']) ? $data['employeeCode'] : '';
$socket_uuid = isset($data['socketUUID']) ? $data['socketUUID'] : '';


try
{

    $query = "SELECT * FROM `devices` WHERE `socket_uuid` = :socket_uuid";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':socket_uuid', $socket_uuid);

    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if($result)
    {
        $query = "UPDATE `devices` SET 
        `firebase_mobile_registration_token` = :firebase_mobile_registration_token, 
        `user_agent_browser` = :user_agent_browser,
        `employee_code` = :employee_code
        WHERE `socket_uuid` = :socket_uuid";

        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':firebase_mobile_registration_token', $firebase_mobile_registration_token);
        $stmt->bindValue(':user_agent_browser', $user_agent_browser);
        $stmt->bindValue(':employee_code', $employee_code);
        $stmt->bindValue(':socket_uuid', $socket_uuid);

        $stmt->execute();
        $lastInsertedId = $pdo->lastInsertId();

        echo json_encode(array('message' => 'Device updated successfully', 'status' => true, 'data' => array('socket_id' => $socket_uuid)));
        exit;
    }


    $query = "INSERT INTO `devices`(`firebase_mobile_registration_token`, `user_agent_browser`, `employee_code`, `socket_uuid`) 
    VALUES (:firebase_mobile_registration_token, :user_agent_browser, :employee_code, :socket_uuid)";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':firebase_mobile_registration_token', $firebase_mobile_registration_token);
    $stmt->bindValue(':user_agent_browser', $user_agent_browser);
    $stmt->bindValue(':employee_code', $employee_code);
    $stmt->bindValue(':socket_uuid', $socket_uuid);

    $stmt->execute();
    $lastInsertedId = $pdo->lastInsertId();

    echo json_encode(array('message' => 'Device registered successfully', 'status' => true, 'data' => array('socket_id' => $socket_uuid)));

}
catch(PDOException $e)
{
    echo json_encode(array('message' => 'Device registration failed', 'status' => false));
    die();
}



?>