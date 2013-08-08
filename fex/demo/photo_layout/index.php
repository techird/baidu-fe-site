<?php 
    function callFlickrAPI($opt){
        $params = array(
            'api_key' => '960d3c7371e60b61513b2236939941fb',
            'method' => null,
            'user_id' => null,
            'format' => 'php_serial',
            'per_page' => '200',
            'page' => '1'
        );
        
        $params = array_merge($params,$opt);
        $encoded_params = array();      
        foreach ($params as $k => $v){
            $encoded_params[] = urlencode($k).'='.urlencode($v);
        }
        $url = "http://api.flickr.com/services/rest/?".implode('&', $encoded_params);
        $rsp = file_get_contents($url);
        $rsp_obj = unserialize($rsp);
        if ($rsp_obj['stat'] == 'ok'){
            return $rsp_obj;
        }
    }
    
    function getListData($param){
        $perPage = 30;
        $i = 0;
        $factor = 1;
        $page = (int)$param['page'];
        preg_match_all("/^.*\//", $_SERVER['SCRIPT_FILENAME'], $cacheFile);
        $cacheFile = $cacheFile[0][0] . $param['user_id'] . '_sets.cache';
        if(file_exists($cacheFile)){
            $cache = file_get_contents($cacheFile);
            $content = unserialize($cache);
            while ($i++ < $factor - 1) {
                $content = array_merge($content, $content);
            }
            $result['sets'] = $content;
            $length = count($result['sets']);
            $result['sets'] = array_slice($result['sets'], ($param['page'] - 1) * $perPage, $perPage);
            $result['page'] = (int)$param['page'];
            $result['perPage'] = $perPage;
            $result['pages'] = ceil($length / $perPage);
            return $result;
        }else{
            $flickrParam = array(
                method => 'flickr.photosets.getList',
                user_id => $param['user_id']
            );
            $listData = callFlickrAPI($flickrParam);
            $listData = $listData['photosets']['photoset'];
            if(!count($listData)){
                throw new Exception("Error: No Sets", 1);
                exit;
            }
            foreach ($listData as $index => $list) {
                $primary = $list['primary'];
                $sizeInfo = callFlickrAPI(array(
                    method => 'flickr.photos.getSizes',
                    photo_id => $primary
                ));
                flush();
                $oriSize = end($sizeInfo['sizes']['size']);
                $listData[$index]['o_width'] = $oriSize['width'];
                $listData[$index]['o_height'] = $oriSize['height'];
            }
            file_put_contents($cacheFile, serialize($listData));
            return getListData($flickrParam);
        }
    }
    
    function getPhotosInList($param){
        $data = callFlickrAPI(array(
            method => 'flickr.photosets.getPhotos',
            extras => 'url_s',
            per_page => $param['per_page'],
            page => $param['page'],
            photoset_id => $param['set_id']
        ));
        return $data['photoset']['photo'];
    }
    
    
    function getComments($param){
        $data = callFlickrAPI(array(
            method => 'flickr.photos.comments.getList',
            per_page => $param['per_page'],
            page => $param['page'],
            photo_id => $param['photo_id']
        ));
        return $data['comments'];
    }
    
    // ajax , get & post
    if( $_REQUEST["type"] && $_REQUEST["type"] == "ajax"  ){
        $method = $_REQUEST["method"];
        if(!empty($method) && function_exists($method)){
            sleep(.5);
            echo json_encode($method($_REQUEST['args']));
        }
        exit;       
    }

    $user_name = isset($_GET['u']) && !empty($_GET['u']) ? $_GET['u'] : 'Colourful Life (Teresa) travelling';
    $user_id = callFlickrAPI(array(
        method => 'flickr.people.findByUsername',
        username => $user_name
    ));
    if(!$user_id){
        echo "INVALID USERNAME";
        exit;
    }
    $user_id = $user_id['user']['id'];
?>
<!DOCTYPE HTML>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
        <meta name="description" content="A simple HTML5 Template">
        <meta name="author" content="Dron">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <title><?= $user_name ?>'s sets</title>
        <link rel="stylesheet" type="text/css" href="css/reset.css">
        <link rel="stylesheet" type="text/css" href="css/photo_layout.css">
        
        <script src="js/libs/zepto.min.js"></script>
        <script src="js/libs/underscore.js"></script>
        <script src="js/libs/backbone.js"></script>
        <script src="js/libs/hammer.js"></script>
        <script src="js/libs/beforeorientationchange.js"></script>
        <script src="js/libs/iscroll.js"></script>
        <script src="js/scroller.js"></script>
        
        <script src="js/libs/app.js"></script>
        <script src="js/libs/app.dispatcher.js"></script>
        
        <script src="js/gallery/galleryWrapper.php"></script>
        <link rel="stylesheet" type="text/css" href="css/gallery/galleryWrapper.css">
        
    </head>
    <body>
        <div class="scroller">
            <div class="scrollContent">
                <div id="album-list-container">
                    <div class="album-content"></div>
                    <div class="album-statusTip">努力加载中...</div>
                </div>
                <?php
                    try{
                        $listData = getListData(array(
                            user_id => $user_id,
                            page => 1
                        ));
                    }catch(Exception $e){
                        echo "<h1 style=\"font-size:30px; color:red;\">". $e->getMessage(). "</h1>";
                    }
                ?>
                <script src="js/waterfallLayout.js"></script>
                <script src="js/photo_layout.js"></script>
                <script>
                var data = <?= json_encode($listData) ?>,
                    userName = "<?= $user_name ?>",
                    userId = "<?= $user_id ?>";
                
                // case begin
                var albumList = new AlbumList();
                albumList.init({
                    scroller: document.querySelector(".scroller"),
                    scrollContent: document.querySelector(".scrollContent")
                });
                
                // sync data
                data['sets'].forEach(function(item){
                    albumList.appendToLayout(item);
                });
                
                /*
                Hammer($('#album-list-container')[0]).on('tap', function(e){
                    var target = $(e.gesture.target).parents('.pin');
                    if(!target.size()) return;
                    
                    var imgOffset = target.find('img').offset(),
                        target = target[0],
                        setId = target.dataset.setId,
                        primaryId = target.dataset.primary,
                        total = target.dataset.len,
                        originY = imgOffset.top + imgOffset.height / 2 - scrollY,
                        originX = imgOffset.left + imgOffset.width / 2 - scrollX;
                    try{
                        galleryMng.destroy();
                    }catch(e){}
                    finally{
                        app.Dispatcher.postMessage( "showPhoto", {
                            from: "photo",
                            total: total,
                            setId: setId,
                            primary: primaryId
                        } );
                    }
                });
                */
               
                </script>
            </div>
        </div>
    </body>
</html>