<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);


    isset($data['jobCardId']) ? $jobCardId = $data['jobCardId'] : $jobCardId = null;
    isset($data['techEmployeeCode']) ? $techEmployeeCode = $data['techEmployeeCode'] : $techEmployeeCode = null;
    isset($data['GRN']) ? $GRN = $data['GRN'] : $GRN = null;
    isset($data['workDate']) ? $workDate = $data['workDate'] : $workDate = null;
    isset($data['startTime']) ? $startTime = $data['startTime'] : $startTime = null;
    isset($data['endTime']) ? $endTime = $data['endTime'] : $endTime = null;
    isset($data['workDescription']) ? $workDescription = $data['workDescription'] : $workDescription = null;
    isset($data['jobCardLines']) ? $jobCardLines = $data['jobCardLines'] : $jobCardLines = null;


    // echo json_encode($data);
    // return;

    $jobCardLines = json_encode($jobCardLines);



    try
    {
        $query =    "INSERT INTO job_card_draft
                ( `job_card_id`, `technician_employee_code`, `goods_received_number`, `work_date`, `start_time`, `end_time`, `work_description`, `job_card_lines` )
                VALUES
                (:jobCardId, :techEmployeeCode, :GRN, :workDate, :startTime, :endTime, :workDescription, :jobCardLines)";


        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':jobCardId', $jobCardId);
        $stmt->bindValue(':techEmployeeCode', $techEmployeeCode);
        $stmt->bindValue(':GRN', $GRN);
        $stmt->bindValue(':workDate', $workDate);
        $stmt->bindValue(':startTime', $startTime);
        $stmt->bindValue(':endTime', $endTime);
        $stmt->bindValue(':workDescription', $workDescription);
        $stmt->bindValue(':jobCardLines', $jobCardLines);
       

        $stmt->execute();
        echo json_encode($pdo->lastInsertId());
    }
    catch (\PDOException $e)
    {
        $stmt = $e->getMessage();
        die($e->getMessage());
    }

?>