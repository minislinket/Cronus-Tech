<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $data = file_get_contents("php://input");
    $data = json_decode($data, true);

    $noteId = $data['id'];
    $title = $data['title'];
    $content = $data['content'];

    /* echo json_encode($data);
    return; */


    try
    {

        $query =    "UPDATE `notes` SET 
                    `title` = ?,
                    `content` = ?
                    WHERE id = ?";

        $stmt = $pdo->prepare($query);
        
        /* $stmt->bindValue('noteId:', $noteId);
        $stmt->bindValue(':title', $title);
        $stmt->bindValue(':content', $content); */

        $stmt->execute([$title, $content, $noteId]);

        echo $noteId;
    }

    catch(PDOException $e)
    {
        die($e->getMessage());
    }