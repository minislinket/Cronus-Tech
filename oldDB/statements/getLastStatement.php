<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST, GET");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");




    $pdo = require('../config/dbConnect.php');

    $data = file_get_contents("php://input");
    $data = json_decode($data);


    $column = $data->column;
    $id = $data->id;
    
    /* echo $column;
    echo $id;
    return; */


    try 
    {
        $pdo->query("SET NAMES utf8");
        $query = "SELECT * FROM `statement` WHERE `".$column."` = ".$id." ORDER BY `updated_at` DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        //$result = json_decode($result);
        header('Content-Type: application/json');
        echo json_encode($result[0]);
    }
    catch(PDOException $e)
    {
        die($e->getMessage());
    }

?>

