<?php
date_default_timezone_set('PRC');
$data = array(
	'success' => true,
	'data' => date('Y-m-d H:i:s'),
	'dataType' => 'AJAX'
);
echo(json_encode($data));
?>