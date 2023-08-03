<?php


    // Local Server
    if($_SERVER['HTTP_HOST'] === 'localhost') 
    {

        $host = '127.0.0.1:8005';
        $db = 'cronus_tech';
        $user = 'root';
        $password = '';

    }

    // Live Server
    else 
    {

        $host = '197.189.208.155';
        $db = 'cronus_tech';      
        $user = 'cronusweb';
        $password = 'cr0nusWEB';

    }
?>