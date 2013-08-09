<!DOCTYPE HTML>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
        <meta name="description" content="A simple HTML5 Template">
        <meta name="author" content="Dron">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <title>Background</title>
        <link rel="stylesheet" type="text/css" href="css/reset.css">
        <link rel="stylesheet" type="text/css" href="css/style.css">
        <script src="js/libs/zepto.min.js"></script>
        <script src="js/libs/hammer.js"></script>
        <script src="js/libs/app.js"></script>
        <script src="js/libs/app.dispatcher.js"></script>
        <script src="js/libs/promise.js"></script>
    </head>
    <body>
        <script src="js/background.js"></script>
        <section class="page">
            <div id="background">
                <div class="a"></div>
                <div class="b"></div>
            </div>
            <div id="foreground"></div>
        </section>
        <script>
            var backgroundUrlBase = "images/background/",
                background = $.background,
                backgroundUrl = backgroundUrlBase + ( Math.floor( Math.random() * <?= (count(scandir("images/background")) - 2) / 2; ?> ) + 1 ),
                $background = $("#background");

            background.setup($background);
            background.load( backgroundUrl ).then( function () {
                background.start();
            });
            
            document.body.addEventListener('touchmove', function(e){
                e.preventDefault();
            }, false);
        </script>
    </body>
</html>