<?  
    $caseName = $_GET['name'];
    $iframe = $_GET['iframe'];
    // $demos = array();
    if(is_dir("cases/".$caseName) && is_file("cases/".$caseName."/index.html")){
        $casesBasePath = "cases/";
        $domDocument = new DOMDocument();
        @$domDocument->loadHTMLFile("./cases/$caseName/index.html");
        $xml = simplexml_import_dom($domDocument);
        if (file_exists("./cases/$caseName/conf.php")) {
            include "./cases/$caseName/conf.php";
            if(isset($conf)){
                $demos = $conf["demos"];
                $qrImages = $conf["qrImages"];
            }
        }
        $title = $xml->head->title;
        $body = $xml->body;
        $content = $body->asXML();
        $content = preg_replace("/(\<img\s*src=\s*\")(img)(\/(.*)\.(png|jpg|jpeg)\")/", "$1$casesBasePath$caseName/$2$3", $content);
    }else{
        echo "Case Not Found";
        exit;
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
		<script src="script/scroller.js"></script>
	</head>
<? if($iframe == 'true') { ?>
	<body class="iframe">
<? } else { ?>
    <body>
<? } ?>
<? if($iframe != 'true') { ?>
        <div class="scroller">
            <div class="scrollContent">
<? } ?>
        		<?=$content;?>
                <?/*
                <?if(isset($demos) && count($demos) > 0){?>
                
                <div class="demoWrapper">
                    <?foreach($demos as $demo){?>
                    <a href="../demo/<?= $demo?>/index.php">Demo 演示</a>
                    <?}?>
                </div>
                
                <?}?>
                */?>
                
                <?if(isset($qrImages) && count($qrImages) > 0){?>
                <div class="footer">
                    <h2>不如亲眼见证</h2>
                    <div class="footer-main">
                        <?foreach($qrImages as $qrImage){?>
                        <div class="footer-item">
                            <a href="<?=$qrImage["link"]?>">
                                <img src="http://chart.apis.google.com/chart?cht=qr&chs=200x200&chl=<?=$qrImage["link"]?>" width="200" height="200" />
                            </a>
                            <p><?=$qrImage["text"]?></p>   
                        </div>
                        <?}?>
                    </div>
                </div>
                <?}?>
<? if($iframe != 'true') { ?>
            </div>
        </div>
<? } ?>
	</body>
</html>