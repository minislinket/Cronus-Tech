<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);
    $noteId = $data['id'];

    try
    {
        $query = 'DELETE FROM `notes` WHERE id = :id';

        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':id', $noteId);
        $stmt->execute();
        echo 'Record deleted';
    }

    catch(PDOException $e)
    {
        die($e->getMessage());
    }