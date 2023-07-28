<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');


$error = file_get_contents("php://input");
$error = json_decode($error, true);




$user = isset($error['user']) ? $error['user'] : null;
$user = isset($user['employeeCode']) ? $user['employeeCode'] : null;
$error = $error;


if(!$user)
{
    die('No user found');
}


try
{
    $query = "INSERT INTO error_log (`user`, `error`) VALUES (:user, :error)";

    $stmt = $pdo->prepare($query);

    $stmt->bindValue(':user', $user);
    $stmt->bindValue(':error', json_encode($error));

    $stmt->execute();
    $lastInsertedId = $pdo->lastInsertId();
    echo $lastInsertedId;
}


catch(PDOException $e)
{
    die($e->getMessage());
}



?>