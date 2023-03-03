<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');

    $data = file_get_contents("php://input");
    //$data = json_decode($data);


    try 
    {
        $query = "DELETE FROM po_draft WHERE id=?";

        $stmt = $pdo->prepare($query);
        $stmt->execute([$data]);
        //$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        //$result = json_decode($result);
        header('Content-Type: application/json');
        echo 'Record deleted...';
    }
    catch(PDOException $e)
    {
        die($e->getMessage());
    }

?>