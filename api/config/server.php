<?php

    /* echo $_SERVER['HTTP_HOST']; */


    if($_SERVER['HTTP_HOST'] === 'localhost') 
    {

        $host = '127.0.0.1';
        $db = 'cronus_v2.1';
        $user = 'root';
        $password = '';

    }

    else 
    {

        $host = '197.189.208.155';
        $db = 'cronus_v2.1';
        $user = 'cronusweb';
        $password = 'cr0nusWEB';

    }
?>