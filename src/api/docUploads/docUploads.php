<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");/* , GET, OPTIONS, PUT, DELETE */
header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");


$pdo = require('../config/dbConnect.php');


$data = file_get_contents("php://input");
$data = json_decode($data, true);

// echo json_encode($data);
// return;

$call_id = isset($data['call_id']) ? $data['call_id'] : '';
$customer_store_id = isset($data['customer_store_id']) ? $data['customer_store_id'] : '';
$job_card_id = isset($data['job_card_id']) ? $data['job_card_id'] : '';
$name = isset($data['name']) ? $data['name'] : '';
$size = isset($data['size']) ? $data['size'] : '';
$status = isset($data['status']) ? $data['status'] : '';
$type = isset($data['type']) ? $data['type'] : '';
$doc_added = isset($data['doc_added']) ? $data['doc_added'] : '';
$upload_attempts = isset($data['upload_attempts']) ? $data['upload_attempts'] : '';
$upload_completed = isset($data['upload_completed']) ? $data['upload_completed'] : '';
$upload_started = isset($data['upload_started']) ? $data['upload_started'] : '';
$upload_error = isset($data['upload_error']) ? $data['upload_error'] : '';
$user = isset($data['employee_code']) ? $data['employee_code'] : '';
$job_card_link_added = isset($data['job_card_link_added']) ? $data['job_card_link_added'] : '';
$job_card_linked = isset($data['job_card_linked']) ? $data['job_card_linked'] : '';
$required = isset($data['required']) ? $data['required'] : '';
$id = isset($data['id']) ? $data['id'] : '';
$db_id = $id.'_'.$user.'_'.$doc_added;

echo $db_id.'\n';

try {

    $query = "SELECT * from `doc_uploads_log`";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $recordExists = false;

    // loop through $result and see if our new record's name matches any of the existing records
    foreach ($result as $row) 
    {
        if ($row['db_id'] == $db_id && $row['call_id'] == $call_id) 
        {
            $recordExists = true;
            break;
        }
    }

    // if the record exists, update it
    if (count($result) > 0 && $recordExists) 
    {
        $query = "UPDATE `doc_uploads_log` SET 
        `call_id` = :call_id, 
        `customer_store_id` = :customer_store_id, 
        `job_card_id` = :job_card_id, 
        `doc_name` = :name, 
        `doc_size` = :size, 
        `upload_status` = :status, 
        `doc_type_id` = :type, 
        `doc_added` = :doc_added,
        `upload_attempts` = :upload_attempts, 
        `upload_completed` = :upload_completed, 
        `upload_started` = :upload_started, 
        `upload_error` = :upload_error,  
        `user_employee_code` = :user,
        `job_card_link_added` = :job_card_link_added,
        `job_card_linked` = :job_card_linked,
        `required` = :required,
        `db_id` = :db_id 
        WHERE `db_id` = :db_id and `call_id` = :call_id";

        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':call_id', $call_id);
        $stmt->bindValue(':customer_store_id', $customer_store_id);
        $stmt->bindValue(':job_card_id', $job_card_id);
        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':size', $size);
        $stmt->bindValue(':status', $status);
        $stmt->bindValue(':type', $type);
        $stmt->bindValue(':doc_added', $doc_added);
        $stmt->bindValue(':upload_attempts', $upload_attempts);
        $stmt->bindValue(':upload_completed', $upload_completed);
        $stmt->bindValue(':upload_started', $upload_started);
        $stmt->bindValue(':upload_error', $upload_error);
        $stmt->bindValue(':user', $user);
        $stmt->bindValue(':job_card_link_added', $job_card_link_added);
        $stmt->bindValue(':job_card_linked', $job_card_linked);
        $stmt->bindValue(':required', $required);
        $stmt->bindValue(':db_id', $db_id);

        $stmt->execute();
        $lastInsertedId = $pdo->lastInsertId();

        echo $lastInsertedId;
    }

    // create the record if it doesn't exist
    else 
    {
        $query = "INSERT INTO `doc_uploads_log`
        (`call_id`, `customer_store_id`, `job_card_id`, `doc_name`, `doc_size`, `upload_status`, `doc_type_id`, `doc_added`, `upload_attempts`, `upload_completed`, `upload_started`, `upload_error`, `user_employee_code`, `job_card_link_added`, `job_card_linked`, `required`, `db_id`) 
        VALUES 
        (:call_id, :customer_store_id, :job_card_id, :name, :size, :status, :type, :doc_added, :upload_attempts, :upload_completed, :upload_started, :upload_error, :user, :job_card_link_added, :job_card_linked, :required, :db_id)";

        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':call_id', $call_id);
        $stmt->bindValue(':customer_store_id', $customer_store_id);
        $stmt->bindValue(':job_card_id', $job_card_id);
        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':size', $size);
        $stmt->bindValue(':status', $status);
        $stmt->bindValue(':type', $type);
        $stmt->bindValue(':doc_added', $doc_added);
        $stmt->bindValue(':upload_attempts', $upload_attempts);
        $stmt->bindValue(':upload_completed', $upload_completed);
        $stmt->bindValue(':upload_started', $upload_started);
        $stmt->bindValue(':upload_error', $upload_error);
        $stmt->bindValue(':user', $user);
        $stmt->bindValue(':job_card_link_added', $job_card_link_added);
        $stmt->bindValue(':job_card_linked', $job_card_linked);
        $stmt->bindValue(':required', $required);
        $stmt->bindValue(':db_id', $db_id);

        $stmt->execute();
        $lastInsertedId = $pdo->lastInsertId();

        echo $lastInsertedId;
    }

}
catch(PDOException $e) 
{
    die($e->getMessage());
}






?>