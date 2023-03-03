<?php

    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");
    header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
    header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


    $pdo = require('../config/dbConnect.php');
    

    $note = file_get_contents("php://input");
    $note = json_decode($note, true);


    $employeeCode = $note['employeeCode'];
    $title = $note['title'];
    $content = $note['content'];



    try
    {
        $query = "INSERT INTO notes (`employeeCode`, `title`, `content`) VALUES (:employeeCode, :title, :content)";

        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':employeeCode', $employeeCode);
        $stmt->bindValue(':title', $title);
        $stmt->bindValue(':content', $content);

        $stmt->execute();
        $lastInsertedId = $pdo->lastInsertId();
        echo $lastInsertedId;
    }


    catch(PDOException $e)
    {
        die($e->getMessage());
    }


    /* if($lastInsertedId) {

        try
        {
            $sql = "SELECT * FROM `notes` WHERE id = $lastInsertedId";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $row = $stmt->fetch();
            echo json_encode($row);
        }

        catch(PDOException $e)
        {
            die($e->getMessage());
        }
    } */
    


?>