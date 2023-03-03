<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);


    $id = $data['id'];
    isset($data['date']) ? $draftDate = $data['date'] : $draftDate = null;
    isset($data['draftCard']) ? $draftCard = $data['draftCard'] : $draftCard = null;
    isset($data['user']) ? $employee = $data['user'] : $employee = null;
    isset($data['customerStore']) ? $customerStore = $data['customerStore'] : $customerStore = null;
    isset($data['customerAccount']) ? $customerAccount = $data['customerAccount'] : $customerAccount = null;
    isset($data['customerPaystation']) ? $customerPaystation = $data['customerPaystation'] : $customerPaystation = null;
    isset($data['jobCards']) ? $jobCards = $data['jobCards'] : $jobCards = null;
    isset($data['quotes']) ? $quotes = $data['quotes'] : $quotes = null;
    isset($data['lines']) ? $invoiceLines = $data['lines'] : $invoiceLines = null;
    isset($data['totals']) ? $totals = $data['totals'] : $totals = null;
    isset($data['workDescription']) ? $workDescription = $data['workDescription'] : $workDescription = null;
    isset($data['orderNumber']) ? $orderNumber = $data['orderNumber'] : $orderNumber = null;
    isset($data['grn']) ? $grn = $data['grn'] : $grn = null;
    isset($data['vat']) ? $vat = $data['vat'] : $vat = null;
    isset($data['priceList']) ? $priceList = $data['priceList'] : $priceList = null;

    $employee = json_encode($employee);
    $draftCard = json_encode($draftCard);
    $customerStore = json_encode($customerStore);
    $customerAccount = json_encode($customerAccount);
    $customerPaystation = json_encode($customerPaystation);
    $jobCards = json_encode($jobCards);
    $quotes = json_encode($quotes);
    $invoiceLines = json_encode($invoiceLines);
    $totals = json_encode($totals);
    $priceList = json_encode($priceList);
    /* $workDescription = json_encode($workDescription);
    $orderNumber = json_encode($orderNumber);
    $grn = json_encode($grn); */


    /* echo $workDescription;
    return; */


    try
    {
        $query =    "UPDATE `invoice_draft` SET 
                    `draftDate` = ?,
                    `draftCard` = ?,
                    `canBackDate` = ?,
                    `canEditPrice` = ?,
                    `employee` = ?, 
                    `customerStore` = ?, 
                    `customerAccount` = ?, 
                    `customerPaystation` = ?, 
                    `jobCards` = ?, 
                    `quotes` = ?, 
                    `invoiceLines` = ?, 
                    `totals` = ?, 
                    `workDescription` = ?, 
                    `orderNumber` = ?, 
                    `grn` = ?, 
                    `priceList` = ?, 
                    `vat` = ?
                    WHERE `id` = ?";

        $stmt = $pdo->prepare($query);

        $stmt->execute([
            $draftDate,
            $draftCard,
            0,
            0,
            $employee,
            $customerStore,
            $customerAccount,
            $customerPaystation,
            $jobCards,
            $quotes,
            $invoiceLines,
            $totals,
            $workDescription,
            $orderNumber,
            $grn,
            $priceList,
            $vat,
            $id
        ]);
        echo $id;
    }

    catch(PDOException $e)
    {
        die($e->getMessage());
    }

?>