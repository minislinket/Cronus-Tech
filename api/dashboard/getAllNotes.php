<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);
    $employeeCode = $data['employeeCode'];

    /* echo $employeeCode;
    return; */

    try
    {
        $pdo->query("SET NAMES utf8");
        $query = "SELECT * FROM `notes` WHERE `employeeCode` = :employeeCode";

        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':employeeCode', $employeeCode);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
    }

    catch(PDOException $e)
    {
        die($e->getMessage());
    }


?>