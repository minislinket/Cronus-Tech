<?php
    require 'server.php';

    try {
            $conn = new PDO("mysql:host=$host;dbname=$db", $user, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } 

    catch(PDOException $e) 
        {
            echo "Connection failed: " . $e->getMessage();
        }
?>