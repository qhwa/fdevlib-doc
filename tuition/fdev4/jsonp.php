<?php
date_default_timezone_set('PRC');
$data = array(
	'success' => true,
	'data' => date('Y-m-d H:i:s'),
	'dataType' => 'JSONP'
);
echo($_GET['callback'].'('.json_encode($data).')');
?>