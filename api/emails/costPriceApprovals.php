<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


$data = file_get_contents("php://input");
$data = json_decode($data, true);


$body = "<h2>Cost Price Approvals - ".date('Y-m-d H:i:s')."</h2><br><br>";
$body .= "<table>";
$body .= "<thead><tr>";
$body .= "<th>Item NPN</th>";
$body .= "<th>Item Name</th>";
$body .= "<th>Price List</th>";
$body .= "<th>Selling Price</th>";
$body .= "<th>Approved</th>";
$body .= "</tr></thead>";
$body .= "<tbody>";
foreach($data as $item)
{
    $body .= "<tr>";
    $body .= "<td>".$item['inventoryItemId']."</td>";
    $body .= "<td>".$item['supplierItemName']."</td>";
    $body .= "<td>".$item['priceList']."</td>";
    $body .= "<td>".$item['price']."</td>";
    $body .= "<td>".$item['approved']."</td>";
    $body .= "</tr>";
}
$body .= "</tbody>";
$body .= "</table>";




// echo json_encode($body);
// return;


//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->SMTPDebug  = 0;                                      //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'smtpauth.zaisp.net';                   //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'locksecure';                           //SMTP username
    $mail->Password   = 'ekd94eol';                             //SMTP password
    $mail->SMTPSecure = null;                                  //Enable implicit TLS encryption
    $mail->Port       = 587;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
    $mail->SMTPAutoTLS = false;

    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    //Recipients
    $mail->setFrom('admin@locksecure.co.za', 'Cronus Admin');
    $mail->addAddress('jennifer@locksecure.co.za', 'Jennifer');     //Add a recipient

    //Content
    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = 'Cost Price Approvals - '.date('Y-m-d H:i:s');
    $mail->Body    = $body;

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}