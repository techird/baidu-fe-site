<!DOCTYPE HTML>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
        <meta name="description" content="A simple HTML5 Template">
        <meta name="author" content="Dron">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <title>Login</title>
        <link rel="stylesheet" type="text/css" href="css/reset.css">
        <link rel="stylesheet" type="text/css" href="css/style.css">
        <script src="js/libs/zepto.min.js"></script>
        <script src="js/libs/app.js"></script>
        <script src="js/libs/app.dispatcher.js"></script>
        <script src="js/libs/promise.js"></script>
        <script src="js/pass-net-api.js"></script>
        <script src="js/login.js"></script>
    </head>
    <body>
        
        <section>
            <div>
                <span class="login">登录</span>
                <span class="logon">你好，<span id="u">undefined</span><span id="logout">登出</span></span>
            </div>
        </section>
        
        <script>
            var login = document.querySelector(".login"),
                logon = document.querySelector(".logon"),
                u = document.querySelector("#u"),
                logout = document.querySelector("#logout"),
                event = "ontouchend" in window ? "touchend" : "mouseup",
                isLogon = false;
            switchStatus = function(){
                if(isLogon){
                    login.classList.remove("hide");
                    login.classList.add("show");
                    logon.classList.remove("show");
                    logon.classList.add("hide");
                    isLogon = false;
                }else{
                    login.classList.add("hide");
                    login.classList.remove("show");
                    logon.classList.add("show");
                    logon.classList.remove("hide");
                    isLogon = true;
                }
            };
            
            document.body.addEventListener("touchmove", function(e){
                e.preventDefault();
            }, false);
            
            login.addEventListener(event, function(){
                app.Dispatcher.trigger("show-login-box");
            });
            
            logout.addEventListener(event, function(){
                app.Dispatcher.trigger("request-logout");
                switchStatus();
            });
            
            app.Dispatcher.on("account:login", function(uName){
                u.innerHTML = uName;
                setTimeout(function(){
                    switchStatus();
                }, 400);
            });
        </script>
    </body>
</html>