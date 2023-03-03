<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);

    // echo json_encode($data);
    // die();

    $employeeCode = $data['employeeCode'];
    $staticPage = $data['staticPage'];


    $hasEmployee = false;
    $userEmployeeCode = '';

    try
    {
        $query = "SELECT * FROM `quick_links` WHERE employee_code = ?";

        $stmt = $pdo->prepare($query);
        $stmt->execute([$employeeCode]);
        $userEmployeeCode = $stmt->fetch();

        $userEmployeeCode ? $hasEmployee = true : $hasEmployee = false;
        $userEmployeeCode = $userEmployeeCode[1];
        
    }
    catch(PDOException $e)
    {
        die($e->getMessage());
    }




    if(!$hasEmployee)
    {



        try
        {
            $query = "INSERT INTO quick_links (`employee_code`, `static_page`) VALUES (:employee_code, :static_page)";

            $stmt = $pdo->prepare($query);

            $stmt->bindValue(':employee_code', $employeeCode);
            $stmt->bindValue(':static_page', $staticPage);

            $stmt->execute();
            $lastInsertedId = $pdo->lastInsertId();
            echo $lastInsertedId;
        }


        catch(PDOException $e)
        {
            die($e->getMessage());
        }




    }




    else
    {
        
        try
        {
            $query =    "UPDATE quick_links
                         SET static_page = ?
                         WHERE employee_code = ?";

            $stmt = $pdo->prepare($query);
            $stmt->execute([$staticPage, $userEmployeeCode]);
            echo $userEmployeeCode;
        }
        catch(PDOException $e)
        {
            die($e->getMessage());
        }

    }


    

    


?>