<?php

require './server.php';

try {
        $conn = new PDO("mysql:host=$host;dbname=$db", $user, $password);
        // set the PDO error mode to exception
        //$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "Connected successfully".phpversion();
    } 

catch(PDOException $e) 
    {
        echo "Connection failed: " . $e->getMessage();
    }

?>