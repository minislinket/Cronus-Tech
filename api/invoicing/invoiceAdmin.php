<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);
    


    try
    {
        $query =    "UPDATE `invoice_draft` SET 

                    `canBackDate` = ?, 
                    `canEditPrice` = ?

                    WHERE `id` = ?";

        $stmt = $pdo->prepare($query);


        foreach($data as $invoice)
        {
            $stmt->execute([
                $invoice['canBackDate'] ? 1 : 0,
                $invoice['canEditPrice'] ? 1 : 0,
                $invoice['id']
            ]);
        }
        echo 200;
    }

    catch(PDOException $e)
    {
        die($e->getMessage());
    }

?>