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
        $query =    "UPDATE `job_card_draft` SET 
                    `goods_received_number` = ?,
                    `work_date` = ?,
                    `start_time` = ?,
                    `end_time` = ?,
                    `work_description` = ?, 
                    `job_card_lines` = ?
                    WHERE `job_card_id` = ?";

        $stmt = $pdo->prepare($query);

        $stmt->execute([
            $GRN,
            $workDate,
            $startTime,
            $endTime,
            $workDescription,
            $jobCardLines,
            $jobCardId
        ]);
        echo $jobCardId;
    }

    catch(PDOException $e)
    {
        die($e->getMessage());
    }

?>