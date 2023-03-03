<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);


    isset($data['user']) ? $employee = $data['user'] : $employee = null;
    isset($data['date']) ? $draftDate = $data['date'] : $draftDate = null;
    isset($data['draftCard']) ? $draftCard = $data['draftCard'] : $draftCard = null;
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


    // echo json_encode($data);
    // return;

    $employee = json_encode($employee);
    $draftCard = json_encode($draftCard);
    $customerStore = json_encode($customerStore);
    $customerAccount = json_encode($customerAccount);
    $customerPaystation = json_encode($customerPaystation);
    $jobCards = json_encode($jobCards);
    $quotes = json_encode($quotes);
    $invoiceLines = json_encode($invoiceLines);
    $totals = json_encode($totals);
    // $workDescription = json_encode($workDescription);
    // $orderNumber = json_encode($orderNumber);
    // $grn = json_encode($grn);
    $priceList = json_encode($priceList);





    try
    {
        $query =    "INSERT INTO invoice_draft
                (`employee`, `customerStore`, `customerAccount`, `customerPaystation`, `jobCards`, `quotes`, `invoiceLines`, `totals`, `workDescription`, `orderNumber`, `grn`, `priceList`, `vat`, `draftDate`, `draftCard`)
                VALUES
                (:employee, :customerStore, :customerAccount, :customerPaystation, :jobCards, :quotes, :invoiceLines, :totals, :workDescription, :orderNumber, :grn, :priceList, :vat, :draftDate, :draftCard)";


        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':employee', $employee);
        $stmt->bindValue(':customerStore', $customerStore);
        $stmt->bindValue(':customerAccount', $customerAccount);
        $stmt->bindValue(':customerPaystation', $customerPaystation);
        $stmt->bindValue(':jobCards', $jobCards);
        $stmt->bindValue(':quotes', $quotes);
        $stmt->bindValue(':invoiceLines', $invoiceLines);
        $stmt->bindValue(':totals', $totals);
        $stmt->bindValue(':workDescription', $workDescription);
        $stmt->bindValue(':orderNumber', $orderNumber);
        $stmt->bindValue(':grn', $grn);
        $stmt->bindValue(':vat', $vat);
        $stmt->bindValue(':draftDate', $draftDate);
        $stmt->bindValue(':draftCard', $draftCard);
        $stmt->bindValue(':priceList', $priceList);

        $stmt->execute();
        echo json_encode($pdo->lastInsertId());
    }
    catch (\PDOException $e)
    {
        $stmt = $e->getMessage();
        die($e->getMessage());
    }

?>