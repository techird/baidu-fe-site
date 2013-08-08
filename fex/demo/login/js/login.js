/**
 * 
 */

void function( exports ){
    var $boxLogon, $boxLogonMask, isBoxLogonShown, localonlyLocked, isInitedApi, isPhoneValue,
        codeStringValue, passportHostName, animating, isOSlt6, jumpPage, successCallBack, nowMode,
        $form, $username, $password, $verifycode, $verificationImg, $verificationChanger, $msg,
        $switchNormal, $usernameLabel, $usernameInput, $buttonSubmit, loginApi, dispatcher, 
        initReady, animations, showVerification, getIsPhone, focus, checkInput, doSubmit, 
        requestLogout, showDeleteIcon, deleteValue, checkReturn, qs;

    // var zepto = require( "lib/zepto" );
    loginApi = passport.data // do require pass-net-api
    dispatcher = app.Dispatcher // do require dispatcher
    initReady = promise.fuze();

    if( !$.TOUCHSTART )
        $.TOUCHSTART = "touchstart" in window ? "touchstart" : "mousedown";

    dispatcher.on( "show-login-box", function(){
        exports.show();
    } );

    dispatcher.on( "hide-login-box", function(){
        exports.hide();
    } );

    dispatcher.on( "request-logout", function(){
        exports.requestLogout();
    } );

    document.addEventListener( "DOMContentLoaded", function(){
        exports.init( "登录贴吧" );
    }, false );

    isBoxLogonShown = false;
    localonlyLocked = false;
    isInitedApi = false;
    isPhoneValue = false;
    codeStringValue = "";
    passportHostName = "passport.baidu.com";
    animating = false;
    isOSlt6 = /OS (\d)/.test( navigator.userAgent ) ? RegExp.$1 - 0 < 6 : false;
    jumpPage = location.protocol + "//" + location.hostname + 
        ( location.port ? ":" + location.port : "" ) + "/Fex-Sample/login/html/v3Jump.html";
    nowMode = "normal";

    qs = function( selector ){
        return document.querySelector( selector );
    };

    animations = function(){
        var mapping, timeConfShow, timeConfHide;

        timeConfShow = isOSlt6 ? ".4s ease" : ".5s cubic-bezier(.23,1.44,.45,.97)";
        timeConfHide = isOSlt6 ? ".4s ease" : ".5s cubic-bezier(.45,.03,.7,-0.33)";

        mapping = {
            "box-logon-show": "box-logon-show " + timeConfShow + " 0 1 normal forwards",
            "box-logon-hide": "box-logon-hide " + timeConfHide + " 0 1 normal forwards",
            "box-logon-shake": "shake .5s linear 0 1 normal forwards",
            "box-logon-localonly": "localonly .5s ease 0 1 normal forwards"
        };

        return {
            apply: function( el, name ){
                el = $( el );
                el.css( "-webkit-animation", "" );
                setTimeout( function(){
                    el.css( "-webkit-animation", mapping[ name ] );
                }, 0 );
                return el;
            }
        };
    }();

    showVerification = function( bool, codeString ){
        if( bool ){
            $boxLogon.addClass( "verification-need" );
            if( codeString ){
                loginApi.getVerifyCodeStr( codeString )
                .success(function(rsp){
                    if(rsp.errInfo.no == 0){
                        codeStringValue = rsp.data.verifyStr;
                        $verificationImg.attr( "src", "https://" + passportHostName + "/cgi-bin/genimage?" + rsp.data.verifyStr );
                    }
                });
            }
        }else{
            $boxLogon.removeClass( "verification-need" );
            $verifycode.val( "" );
        }
    };

    getIsPhone = function(){
        return isPhoneValue ? "true" : "false";
    };

    focus = function( $el ){
        setTimeout( function(){
            $el[ 0 ].focus();
        }, 5e2 );  
    };

    checkInput = function( u, p, v ){
        if( u === "" ){
            exports.shake();
            focus( $username );
            return ;
        }else if( p === "" ){
            exports.shake();
            focus( $password );
            return ;
        }

        loginApi.login( {
            userName: u,
            password: p,
            codeString: codeStringValue,
            verifyCode: v || "",
            isPhone: getIsPhone(),
            memberPass: true,
            staticPage: jumpPage,
            timeSpan: ( new Date ).getTime()
        } ).success( function( rsp ){
            if( rsp.errInfo.no == 0 ){
                if( rsp.data.needToModifyPassword ){
                    window.loaction.href = "https://" + passportHostName + "/forcsdnpasschange?u=" + location.href;
                } else {
                    exports.hide();
                    $msg.html( "&nbsp;" );

                    var url = "";

                    $.ajax( {
                        url: url,
                        success: function( data ){
                            try{
                                var text = data.match( /<script\s+id=\"variables\"\s*>([\d\D]+?)<\/script>/ );
                                if( text )
                                    eval( text[1].replace( /var /g, "window." ) );
                            }finally{
                                successCallBack && successCallBack();
                                dispatcher.trigger( "account:login" , u);
                            }
                        }
                    } );
                }
            } else {
                exports.shake();

                if( rsp.errInfo.msg ){
                    $msg.html( rsp.errInfo.msg );
                }

                if( rsp.data.codeString ){
                    showVerification( true, rsp.data.codeString );
                }else if( ~rsp.errInfo.msg.indexOf( "\u9a8c\u8bc1\u7801" ) ){
                    showVerification( true, "" );    
                }

                if( rsp.errInfo.field ){
                    setTimeout( function(){
                        $( "input[name=" + rsp.errInfo.field.toLowerCase() + "]", $form ).focus();
                    }, 500 );
                }


            }
        } );
    };

    doSubmit = function(){
        var u, p, v;

        u = $username.val();
        p = $password.val();
        v = $verifycode.val();

        checkInput( u, p, v );
    }

    requestLogout = function( callback ){
        var url = "http://" + passportHostName + "/?logout&t=";
        var times = 0, timer, timer2;
        var now = ( new Date ).getTime();
        var test = function(){
            return true;
        };
        new Image().src = url + Math.random();
        timer = setInterval( function(){
            if( test() ){
                clearInterval( timer );
                clearTimeout( timer2 );
                callback && callback( true );
                is_login = "0";
                dispatcher.trigger( "account:logout" );
                return ;
            }

            if( ++ times == 15 ){
                times = 0;
                new Image().src = url + Math.random();
            }
        }, 100 );
        timer2 = setTimeout( function(){
            clearInterval( timer );
            callback && callback( false );
        }, 3000 );
    };

    showDeleteIcon = function( selector ){
        return function(){
            if( $( this ).val() )
                $( selector ).show();
            else
                $( selector ).hide();
        }
    };

    deleteValue = function( $el ){
        return function(){
            focus( $el.val( "" ) );
            $( this ).hide();
        }  
    };

    checkReturn = function( e ){
        var me = this, $me = $( me ), t = 5e2;
        if( e.keyCode == 13 ){
            if( $me.is( "[name=username]" ) ){
                $me[ 0 ].blur();
                focus( $password );
            }else if( $me.is( "[name=password]" ) ){
                if( $boxLogon.hasClass( "verification-need" ) ){
                    $me[ 0 ].blur();
                    focus( $verifycode );
                }else{
                    setTimeout(function(){
                        $me.blur();
                    }, t );
                }
            }else{
                setTimeout(function(){
                    $me.blur();
                }, t );
            }
        }
    };

    initReady( function(){
        $boxLogon = $( ".box-logon" );
        $boxLogonMask = $( ".box-logon-mask" );
        $form = $( ".form", $boxLogon );
        $username = $( "input[name=username]", $form );
        $password = $( "input[name=password]", $form );
        $verifycode = $( "input[name=verifycode]", $form );
        $verificationImg = $( ".verification img", $form );
        $verificationChanger = $( ".verification a", $form );
        $msg = $( ".msg span", $form );
        $switchNormal = $( ".switch-normal", $boxLogon );
        $switchCellphone = $( ".switch-cellphone", $boxLogon );
        $usernameLabel = $( ".username label", $boxLogon );
        $usernameInput = $( ".username input", $boxLogon );
        $buttonSubmit = $( ".button-submit", $boxLogon );

        $( ".button-cancel" ).on( $.TOUCHSTART, function( event ){
            exports.hide();
        } );

        $( ".button-register" ).on( $.TOUCHSTART, function( event ){
            exports.register();
        } );

        $boxLogonMask.on( $.TOUCHSTART, function( event ){
            exports.localonly();
        } );

        $username.on( "input", showDeleteIcon( ".delete-username" ) );
        $password.on( "input", showDeleteIcon( ".delete-password" ) );

        $username.on( "keydown", checkReturn );
        $password.on( "keydown", checkReturn );
        $verifycode.on( "keydown", checkReturn );

        $( ".delete-username" ).on( $.TOUCHSTART, deleteValue( $username ) );
        $( ".delete-password" ).on( $.TOUCHSTART, deleteValue( $password ) );

        $switchNormal.on( $.TOUCHSTART, function(){
            if( nowMode != "normal" ){
                nowMode = "normal";
                isPhoneValue = false;
                $usernameLabel.html( "\u5e10 \u53f7" );
                $usernameInput.prop( "placeholder", "\u8f93\u5165\u5e10\u53f7" );
                $usernameInput.prop( "type", "text" );
                $switchNormal.addClass( "on" );
                $switchCellphone.removeClass( "on" );
            }
        } );

        $switchCellphone.on( $.TOUCHSTART, function(){
            if( nowMode != "cellphone" ){
                nowMode = "cellphone";
                isPhoneValue = true;
                $usernameLabel.html( "\u624b\u673a\u53f7" );
                $usernameInput.prop( "placeholder", "\u8f93\u5165\u624b\u673a\u53f7" );
                $usernameInput.prop( "type", "number" );
                $switchNormal.removeClass( "on" );
                $switchCellphone.addClass( "on" );
            }
        } );

        $buttonSubmit.on( $.TOUCHSTART, doSubmit );

        $username.blur( function(){
            var u;

            u = $username.val();

            loginApi.loginCheck( { 
                userName: u,
                isPhone: getIsPhone(),
                timeSpan: ( new Date ).getTime()
            } ).success( function( rsp ){
                if( rsp.data.codeString ){
                    showVerification( true, rsp.data.codeString );
                } else {
                    showVerification( false );
                }
            } );
        } );

        $verificationChanger.on( $.TOUCHSTART, function(){
            loginApi.getVerifyCodeStr().success(function( rsp ){
                if(rsp.errInfo.no == 0){
                    showVerification( true, rsp.data.verifyStr );
                }
            });
        } );
    } );

    var lockAnim = function(){
        var r = animating;
        animating = true;
        setTimeout( function(){
            animating = false;
        }, 6e2 );
        return r;
    };

    exports.init = function( title ){
        var styleText = [
            "            @-webkit-keyframes box-logon-show{",
            "                0%   { -webkit-transform: translate(0,800px); }",
            "                100% { -webkit-transform: translate(0,0); }",
            "            }",
            "",
            "            @-webkit-keyframes box-logon-hide{",
            "                0%   { -webkit-transform: translate(0,0); }",
            "                100% { -webkit-transform: translate(0,-800px); }",
            "            }",
            "",
            "            @-webkit-keyframes shake{",
            "                0%    { -webkit-transform: translate(0,0); }",
            "                12.5% { -webkit-transform: translate(5px,0); }",
            "                25%   { -webkit-transform: translate(-10px,0); }",
            "                37.5% { -webkit-transform: translate(20px,0); }",
            "                50%   { -webkit-transform: translate(-40px,0); }",
            "                62.5% { -webkit-transform: translate(20px,0); }",
            "                75%   { -webkit-transform: translate(-10px,0); }",
            "                87.5% { -webkit-transform: translate(5px,0); }",
            "                100%  { -webkit-transform: translate(0,0); }",
            "            }",
            "",
            "            @-webkit-keyframes localonly{",
            "                0%   { -webkit-transform: scale(1,1); }",
            "                25%  { -webkit-transform: scale(1.05,1.05); }",
            "                50%  { -webkit-transform: scale(0.95,0.95); }",
            "                75%  { -webkit-transform: scale(1.05,1.05); }",
            "                100% { -webkit-transform: scale(1,1); }",
            "            }",
            "",
            "            .box-logon-mask{",
            "                position: absolute;",
            "                left: 0;",
            "                top: -10000px;",
            "                width: 100%;",
            "                height: 100%;",
            "                background: #000;",
            "                opacity: 0;",
            "                z-index: 310;",
            "                -webkit-transition: opacity .5s linear;",
            "            }",
            "",
            "            .box-logon{",
            "                width: 525px;",
            "                height: 433px;",
            "                border: 1px solid #161616;",
            "                background: #2b2b2b;",
            "                border-radius: 5px;",
            "                box-shadow: 0 2px 12px #000;",
            "                left: 50%;",
            "                top: -10000px;",
            "                margin: -216.5px auto auto -262.5px;",
            "                opacity: 0;",
            "                position: absolute;",
            "                /*display: none;*/",
            "                z-index: 320;",
            "                -webkit-transition: .5s ease-out;",
            "                -webkit-transition-property: height, opacity;",
            "            }",
            "",
            "            .box-logon img{ display: inline; }",
            "",
            "            .box-logon.verification-need{",
            "                height: 480px;",
            "            }",
            "",
            "            .box-logon .inner-border{",
            "                width: -webkit-calc(100% - 2px);",
            "                height: -webkit-calc(100% - 2px);",
            "                border: 1px solid #3f3f3f;",
            "                border-radius: 5px;",
            "            }",
            "",
            "            .box-logon .caption{",
            "                height: 54px;",
            "                line-height: 54px;",
            "                text-align: center;",
            "                background: -webkit-linear-gradient(#575757,#2b2b2b);",
            "                font-size: 20px;",
            "                color: #fff;",
            "                border-bottom: 1px solid #1d1d1d;",
            "            }",
            "",
            "            .box-logon .container{",
            "                border-top: 1px solid #3a3a3a;",
            "            }",
            "",
            "            .box-logon .button{",
            "                width: 60px;",
            "                height: 34px;",
            "                background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#636363), to(#272727), color-stop(.05,#444444));",
            "                border-radius: 5px;",
            "                -webkit-appearance: none;",
            "                -webkit-box-shadow: 0 1px 1px #000;",
            "                text-shadow: 0 1px 2px #000;",
            "                border: 1px solid #292929;",
            "                font-size: 18px;",
            "                line-height: 34px;",
            "                color: #fff;",
            "                text-align: center;",
            "            }",
            "            .box-logon .button:active{",
            "                background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#272727), to(#636363), color-stop(.05,#444444));",
            "            }",
            "",
            "            .box-logon .button-cancel{",
            "                float: left;",
            "                margin: 10px auto auto 10px;",
            "            }",
            "",
            "            .box-logon .button-register{",
            "                float: right;",
            "                margin: 10px 10px auto auto;",
            "            }",
            "",
            "            .box-logon .container .mode{",
            "                width: auto;",
            "                height: 74px;",
            "                padding-top: 32px;",
            "                text-align: center;",
            "            }",
            "",
            "            .box-logon .container .mode .bars{",
            "                width: 394px;",
            "                height: 47px;",
            "                margin: auto;",
            "            }",
            "",
            "            .box-logon .container .mode .bars .switch{",
            "                display: block;",
            "                background: -webkit-linear-gradient(#363636,#292929);",
            "                border: 1px solid #000;",
            "                color: #595959;",
            "                font-size: 20px;",
            "                line-height: 47px;",
            "                -webkit-transition: .5s ease;",
            "                -webkit-transition-property: color;",
            "            }",
            "",
            "            .box-logon .container .mode .bars .switch.on{",
            "                background: #202020;",
            "                color: #fff;",
            "            }",
            "",
            "            .box-logon .container .mode .bars .switch.switch-normal{",
            "                float: left;",
            "                width: 195px;",
            "                border-radius: 5px 0 0 0;",
            "            }",
            "",
            "            .box-logon .container .mode .bars .switch.switch-cellphone{",
            "                border-radius: 5px 5px 0 0;",
            "            }",
            "",
            "            .box-logon .container .form{",
            "                width: auto;",
            "                text-align: center;",
            "                -webkit-tap-highlight-color: rgba( 0, 0, 0, 0 );",
            "            }",
            "",
            "            .box-logon .container .form .group{",
            "                width: 392px;",
            "                margin: auto;",
            "            }",
            "",
            "            .box-logon .container .form .border{",
            "                width: 100%;",
            "                height: 100%;",
            "                border: 1px solid #0c0c0c;",
            "                border-radius: 5px;",
            "                background: #e7e7e7;",
            "                text-align: left;",
            "                box-shadow: 0 1px 1px #808080;",
            "            }",
            "",
            "            .box-logon .container .form .line{",
            "                width: auto;",
            "                height: 47px;",
            "                line-height: 47px;",
            "            }",
            "",
            "            .box-logon .container .form .line label{",
            "                display: inline-block;",
            "                width: 80px;",
            "                text-indent: 10px;",
            "                font-size: 20px;",
            "                color: #323232;",
            "            }",
            "",
            "            .box-logon .container .form .line input{",
            "                border: 0;",
            "                background: transparent;",
            "                width: 290px;",
            "                height: 100%;",
            "                outline: none;",
            "                font-size: 20px;",
            "            }",
            "",
            "            .box-logon .container .form .line .delete{",
            "                position: absolute;",
            "                display: none;",
            "            }",
            "",
            "            .box-logon .container .form .line .delete .bar{",
            "                position: relative;",
            "                left: -30px;",
            "                top: 2px;",
            "                display: inline-block;",
            "                width: 30px;",
            "                height: 30px;",
            "                border-radius: 15px;",
            "                line-height: 28px;",
            "                background: #9c9c9c;",
            "                text-align: center;",
            "                font-weight: 700;",
            "                font-size: 20px;",
            "                color: #fff;",
            "            }",
            "",
            "            .box-logon .container .form .username{",
            "                border-bottom: 1px solid #b4b4b4;",
            "                outline: none;",
            "            }",
            "",
            "            .box-logon .container .form .password{",
            "                border-top: 1px solid #f9f9f9;",
            "                outline: none;",
            "            }",
            "",
            "            .box-logon .container .form .verification{",
            "                padding-top: 10px;",
            "                overflow: hidden;",
            "                height: 0;",
            "                opacity: 0;",
            "                -webkit-transition: .5s ease;",
            "                -webkit-transition-property: opacity, height;",
            "            }",
            "",
            "            .box-logon.verification-need .container .form .verification{",
            "                height: 47px;",
            "                opacity: 1;",
            "            }",
            "",
            "            .box-logon .container .form .verification .border{",
            "                width: 226px;",
            "            }",
            "",
            "            .box-logon .container .form .verification input{",
            "                width: 130px;",
            "            }",
            "",
            "            .box-logon .container .form .verification .info{",
            "                float: right;",
            "                line-height: 47px;",
            "            }",
            "",
            "            .box-logon .container .form .verification .info img{",
            "                width: 70px;",
            "                height: 29px;",
            "                border: 0;",
            "                border-radius: 2px;",
            "                position: relative;",
            "                top: 8px;",
            "            }",
            "",
            "            .box-logon .container .form .verification .info a{",
            "                font-size: 20px;",
            "                color: #ccc;",
            "                display: inline-block;",
            "                width: 70px;",
            "            }",
            "",
            "            .box-logon .container .form .group.submit{",
            "                padding-top: 28px;",
            "            }",
            "",
            "            .box-logon .container .form .submit .button{",
            "                width: 100%;",
            "                height: 47px;",
            "                background: -webkit-linear-gradient(#3d93b8,#235586);",
            "                border: 1px solid #161616;",
            "                -webkit-box-shadow: 0 1px 1px #373737;",
            "            }",

            "            .box-logon .container .form .submit .button:active{",
            "                background: -webkit-linear-gradient(#235586,#3d93b8);",
            "            }",
            "",
            "            .box-logon .container .form .msg{",
            "                padding-top: 16px;",
            "                text-align: left;",
            "            }",
            "",
            "            .box-logon .container .form .msg .forget{",
            "                color: #0094e0;",
            "                float: right;",
            "                font-size: 20px;",
            "            }",

            "            .box-logon .container .form .msg .forget:active{",
            "                color: #22b6f2;",
            "            }",

            "",
            "            .box-logon .container .form .msg span{",
            "                color: #f00;",
            "            }"
        ];

        var template = [
            "<div class='box-logon-mask' style='display: none'></div>",
            "<div class='box-logon' style='display: none'>",
                "<div class='inner-border'>",
                    "<div class='caption'>",
                        "<a class='button button-cancel' onclick='return false;'>取消</a>",
                        "<a class='button button-register' onclick='return false;'>注册</a>",
                        "<span>" + ( title || "登录" ) + "</span>",
                    "</div>",
                    "<div class='container'>",
                        "<div class='mode'>",
                            "<div class='bars'>",
                                "<a class='switch switch-normal on' onclick='return false;'>普通登录</a>",
                                "<a class='switch switch-cellphone' onclick='return false;'>手机登录</a>",
                            "</div>",
                        "</div>",
                        "<div class='form'>",
                            "<div class='group'>",
                                "<div class='border'>",
                                    "<div class='line username'>",
                                        "<label>帐 号</label>",
                                        "<input type='text' name='username' placeholder='输入账号'>",
                                        "<span class='delete delete-username'><span class='bar'>&times;</span></span>",
                                    "</div>",
                                    "<div class='line password'>",
                                        "<label>密 码</label>",
                                        "<input type='password' name='password' placeholder='输入密码'>",
                                        "<span class='delete delete-password'><span class='bar'>&times;</span></span>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='group verification'>",
                                "<div class='info line'>",
                                    "<img src=''>",
                                    "<a onclick='return false;'>换一张</a>",
                                "</div>",
                                "<div class='border'>",
                                    "<div class='line'>",
                                        "<label>验证码</label>",
                                        "<input type='text' name='verifycode' placeholder='输入验证码'>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='group submit'>",
                                "<input type='button' class='button button-submit' value='登录'>",
                            "</div>",
                            "<div class='group msg'>",
                                "<a class='forget' href='https://passport.baidu.com/?getpass_index' target='_blank'>忘记密码？</a>",
                                "<span></span>",
                            "</div>",
                        "</div>",
                    "</div>",
                "</div>",
            "</div>"
        ];

        var style = document.createElement( "style" );

        style.appendChild( document.createTextNode( styleText.join( "" ) ) );

        ( document.head || document.body ).appendChild( style );

        var container = document.createElement( "div" );
        container.innerHTML = template.join( "" );

        while( container.firstChild )
            document.body.appendChild( container.firstChild );

        initReady.fire();

        setTimeout( function(){
            qs( ".box-logon-mask" ).style.display =
            qs( ".box-logon" ).style.display = "block";
        }, 500 );
    };

    exports.show = function( config ){
        if( lockAnim() )
            return ;

        if( config && config.success ){
            successCallBack = config.success;
        }else{
            successCallBack = null;       
        }

        if( !isBoxLogonShown ){
            isBoxLogonShown = true;
            $boxLogonMask.css( "top", 0 );
            $boxLogon.css( "top", "50%" );
            animations.apply( $boxLogon, "box-logon-show" ).css( "opacity", 1 );
            $boxLogonMask.css( "opacity", 0.5 );
            $msg.html( "&nbsp;" );
        }

        if( !isInitedApi ){
            isInitedApi = true;

            loginApi.getApiInfo({ apiType: 'login' }).success(function( rsp ){
                if( rsp.errInfo.no == 0 )
                    loginApi.setContext({
                        token: rsp.data.token
                    });
            });
        }
    };

    exports.hide = function(){
        if( lockAnim() )
            return ;

        if( isBoxLogonShown ){
            isBoxLogonShown = false;
            showVerification( false );
            animations.apply( $boxLogon, "box-logon-hide" ).css( "opacity", 0 );
            $boxLogonMask.css( "opacity", 0 );
            setTimeout( function(){
                $boxLogonMask.css( "top", "-10000px" );
                $boxLogon.css( "top", "-10000px" );
            }, 5e2 );
        }
    };

    exports.shake = function(){
        if( lockAnim() )
            return ;

        animations.apply( $boxLogon, "box-logon-shake" );
    };

    exports.localonly = function(){
        if( lockAnim() )
            return ;

        if( localonlyLocked )
            return ;

        if( isBoxLogonShown ){
            animations.apply( $boxLogon, "box-logon-localonly" );
            localonlyLocked = true;
            setTimeout( function(){
                localonlyLocked = false;
            }, 500 );
        }
    };

    exports.register = function(){
        window.open( "https://" + passportHostName + "/v2/?reg&regType=1&tpl=mn&u=" + location.href );  
    };

    exports.requestLogout = requestLogout;
}( {} );
