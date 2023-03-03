<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    // $data = json_decode($data, true);
    // $employeeCode = $data['employeeCode'];

    // echo json_encode($data);
    // die();

    $employeeCode = $data;
    $userStaticPage = '';

    try
    {
        $query = "SELECT `static_page` FROM `quick_links` WHERE employee_code = ?";

        $stmt = $pdo->prepare($query);
        $stmt->execute([$employeeCode]);
        $userStaticPage = $stmt->fetch();

        echo json_encode($userStaticPage);

        /* $userEmployeeCode ? $hasEmployee = true : $hasEmployee = false;
        $userEmployeeCode = $userEmployeeCode[1]; */
        
    }
    catch(PDOException $e)
    {
        die($e->getMessage());
    }



?>