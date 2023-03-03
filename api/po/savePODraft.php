<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);


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
        $query =    "INSERT INTO po_draft
                    (`employee`, `supplier`, `inventory_store`, `delivery_address`, `lines`, `quote_number`, `vat_rate`, `sub_total`, `vat`, `total`)
                    VALUES
                    (:employee, :supplier, :inventoryStore, :deliveryAddress, :lines, :quoteNumber, :vatRate, :subTotal, :vat, :total)";


        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':employee', $employee);
        $stmt->bindValue(':supplier', $supplier);
        $stmt->bindValue(':inventoryStore', $inventoryStore);
        $stmt->bindValue(':deliveryAddress', $deliveryAddress);
        $stmt->bindValue(':lines', $lines);
        $stmt->bindValue(':quoteNumber', $quoteNumber);
        $stmt->bindValue(':vatRate', $vatRate);
        $stmt->bindValue(':subTotal', $subTotal);
        $stmt->bindValue(':vat', $vat);
        $stmt->bindValue(':total', $total);

        $stmt->execute();
        echo json_encode($pdo->lastInsertId());
    }
    catch (\PDOException $e)
    {
        $stmt = $e->getMessage();
        die($e->getMessage());
    }

?> 