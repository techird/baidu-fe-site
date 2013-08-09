<?
    $caseName = $_GET['name'];
    if(is_dir("cases/".$caseName) && is_file("cases/".$caseName."/index.html")){
        $casesBasePath = "cases/";
        $domDocument = new DOMDocument();
        $domDocument->loadHTMLFile("./cases/$caseName/index.html");
        $xml = simplexml_import_dom($domDocument);
    
        $title = $xml->head->title;
        $body = $xml->body;
        $content = $body->asXML();
        $content = preg_replace("/(\<img\s*src=\s*\")(img)(\/(.*)\.(png|jpg|jpeg)\")/", "$1$casesBasePath$caseName/$2$3", $content);
    }else{
        echo "Case Not Found";
    }
?>

<!DOCTYPE html>
<html>
	<head>
		<title><?=$title?></title>
		<link rel="stylesheet" href="style/index.css">
		<meta http-equiv="Content-Type" content="text/HTML; charset=utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
	</head>
	<body>
		<?=$content;?>
	</body>
</html>