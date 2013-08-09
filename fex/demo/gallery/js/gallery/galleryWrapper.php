<?
    header('Content-Type: application/javascript');
    function __inline($file, $is_widget=false){
        if($is_widget){
            $file = "widget/" . $file;
        }
        if(is_file($file)){
            $content = file_get_contents($file);
            echo "\n/**** " .$file. " Start". " **/ \n";
            echo $content;
            echo "\n/**** " .$file. " End". " **/ \n";
        }
    }
?>

<?
__inline('slider.js');
__inline('thumbnail.js');
__inline('scaleable.js');
__inline('galleryCore.js');
__inline('galleryData.js');
__inline('flickrDataAdapter.js');
__inline('galleryMng.js');
include('widget/galleryWidgets.php');
__inline('galleryHandler.js');
?>