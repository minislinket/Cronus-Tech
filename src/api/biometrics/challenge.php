<?php



header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

function stringToArray($s)
    {
        /* convert binary string to array of uint8 */
        $a = [];
        for ($idx = 0; $idx < strlen($s); $idx++) {
            $a[] = ord($s[$idx]);
        }
        return $a;
    }


echo json_encode(stringToArray(random_bytes(16)));


?>