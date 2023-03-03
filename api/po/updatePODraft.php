<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);


    $id = $data['id'];
    isset($data['user']) ? $employee = $data['user'] : $employee = null;
    isset($data['supplier']) ? $supplier = $data['supplier'] : $supplier = null;
    isset($data['inventoryStore']) ? $inventoryStore = $data['inventoryStore'] : $inventoryStore = null;
    isset($data['deliveryAddress']) ? $deliveryAddress = $data['deliveryAddress'] : $deliveryAddress = null;
    isset($data['lines']) ? $lines = $data['lines'] : $lines = null;
    isset($data['quoteNumber']) ? $quoteNumber = $data['quoteNumber'] : $quoteNumber = null;
    isset($data['vatRate']) ? $vatRate = $data['vatRate'] : $vatRate = null;
    isset($data['subTotal']) ? $subTotal = $data['subTotal'] : $subTotal = null;
    isset($data['vat']) ? $vat = $data['vat'] : $vat = null;
    isset($data['total']) ? $total = $data['total'] : $total = null;
    


    // echo json_encode($data);
    // return;

    $employee = json_encode($employee);
    $supplier = json_encode($supplier);
    $inventoryStore = json_encode($inventoryStore);
    $deliveryAddress = json_encode($deliveryAddress);
    $lines = json_encode($lines);



    try
    {
        $query =    "UPDATE `po_draft` SET 
                    `supplier` = ?,
                    `inventory_store` = ?,
                    `delivery_address` = ?,
                    `employee` = ?, 
                    `lines` = ?, 
                    `quote_number` = ?, 
                    `vat_rate` = ?, 
                    `sub_total` = ?, 
                    `vat` = ?, 
                    `total` = ?
                    WHERE `id` = ?";

        $stmt = $pdo->prepare($query);

        $stmt->execute([
            $supplier,
            $inventoryStore,
            $deliveryAddress,
            $employee,
            $lines,
            $quoteNumber,
            $vatRate,
            $subTotal,
            $vat,
            $total,
            $id
        ]);
        echo $id;
    }

    catch(PDOException $e)
    {
        die($e->getMessage());
    }

?>