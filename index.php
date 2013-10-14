<?
    if(preg_match('/Mobile/', $_SERVER['HTTP_USER_AGENT'])) {
        header('Location: fex/mobile.php');
        die();
    }else if(preg_match('/MSIE 8.0/', $_SERVER['HTTP_USER_AGENT'])){
       header('Location: fex/ie8.php');
       die();
    }
?>

<!DOCTYPE HTML>
<html>
<head>
    <link rel="shortcut icon" href="fex/favicon.ico" type="image/x-icon" />
    <meta charset="utf-8" />
    <title>Baidu FE</title>
    <link rel="stylesheet" href="fex/fe.css" media="screen" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <script type="text/javascript" src="http://fe.bdimg.com/tangram/latest.js"></script>
    <script src="fex/tools.js"></script>
    <script src="fex/Event.js"></script>
    <script src="fex/Screen.js"></script>
    <script src="fex/Stage.js"></script>
    <script src="fex/Splash.js"></script>    
    <script src="fex/Control.js"></script>
    <script src="fex/CSS3Animate.js"></script>
    <script src="fex/SlideShow.js"></script>
    <script src="fex/fe.js"></script>
    <script>
        var pageId = 'fexhomepage';
    </script>
    <script type="text/javascript" src="http://img.baidu.com/hunter/femonk.js"></script>
</head> 
<body>
    <img src="fex/fedays2.png" style="display:none;" />

    <ul class="loading">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>

    <h1 id="logo">FEX <span>最专业的前端团队</span></h1>
    <div id="top-nav">
        <div id="menu">
            <ul>
                <li screens="topic" class="s1"><a href="#topic">技术</a></li>
                <li screens="archive" class="s2"><a href="#archive">大牛</a></li>
                <li screens="team" class="s3"><a href="#team">团队</a></li>
                <li screens="contact" class="s4"><a href="#contact">关注</a></li>
                <li screens="case" class="s5"><a href="#case">案例</a><span>HOT</span></li>
                <!-- 目前还没有这个功能
                    <li screens="boke" class="s6"><a href="javascript:;">博客</a></li>
                -->
                aaaaa
            </ul>
        </div>
    </div>

    <div id="about">
        <div class="left">
            <h2>The best or nothing</h2>
        </div>
        <div class="right">
            <p>我们是工程师和艺术家。</p>
            <p>技术问题在这里不是问题，</p>
            <p>我们有大把的时间，</p>
            <p>花在优化前端工程技术，</p>
            <p>和提高产品体验上。</p>
            <p>直到我们技术和想法，</p>
            <p>改变了产品，提高了效率。</p>
            <p>可能你都没有注意到，</p>
            <p>但你总能感觉到。</p>
            <p>这是我们的印迹。</p>
            <p>它代表了我们的价值。</p>
        </div>
    </div>
    
    <div id="stage">
        <div class="screen" id="home" > 
            <!--第二季FEday     
            <h1>F.E.X<span>Best or nothing</span></h1>
            -->
            <div class="meeting-info"></div>
            <div class="nav down"></div>
        </div>
        <div class="screen" id="topic" >
            <div class="topic-container">               
                <p class="tool">平台工具</p>
                <p class="data">数据监控</p>
                <p class="end">端技术</p>
            </div>
            <div class="topic-content case-list">
                <ul class="tool">
                    <li class="fis">
                        <h1>FIS</h1>
                        <p>使用FIS，让前端团队可以快速进入角色，高效解决开发过程中模板、框架、自动化、性能优化等问题</p>
                        <a class="show-case" href="fex/case/show.php?name=fis" target="_blank">查看</a>
                    </li>
                    <li class="ueditor">
                        <h1>UEditor</h1>
                        <p>UEditor是一套开源的在线HTML所见即所得富文本web编辑器，具有轻量，可定制，注重用户体验等特点，开源基于BSD协议，允许自由使用和修改代码</p>
                        <a class="show-case" href="fex/case/show.php?name=ueditor" target="_blank">查看</a>
                    </li>
                </ul>
                <ul class="data">
                    <li class="speed">
                        <h1>Speed</h1>
                        <p>WebSpeed为您提供了整套的用户性能监控及优化方案，是您提升用户访问速度、改善用户体验的有力助手！ </p>
                        <a class="show-case" href="fex/case/show.php?name=speed" target="_blank">查看</a>
                    </li>
                    <li class="uxrp">
                        <h1>UXRP</h1>
                        <p>UXRP通过捕获用户的"蛛丝马迹"为您提供精准的用户页面行为数据，并将这些数据进行可视化展现。让用户数据来更好的帮助你的产品</p>
                        <a class="show-case" href="fex/case/show.php?name=uxrp" target="_blank">查看</a>
                    </li>
                </ul>
                <ul class="end">
                    <li class="chassis">
                        <h1>Chassis</h1>
                        <p>Chassis提供了一套类Backbone的MVC代码架构，在此基础上延伸了视图层管理，优化了路由控制以及更加轻量级的实现。</p>
                        <a class="show-case" href="fex/case/show.php?name=chassis" target="_blank">查看</a>
                    </li>
                    <li class="gmu">
                        <h1>GMU</h1>
                        <p>基于Zepto并且面向移动端的UI组件库，价值在于为移动端快速开发提供稳定、丰富的UI组件。</p>
                        <a class="show-case" href="fex/case/show.php?name=gmu" target="_blank">查看</a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="screen" id="archive" >
            <h1>团队中有大咖，让工作本身就成为一种追求</h1>
            <div id="head-container">
                <div class="archive-head m1"></div>
                <div class="archive-head m2"></div>
                <div class="archive-head m3"></div>
                <div class="archive-head m4"></div>
                <div class="archive-head m5"></div>
                <div class="archive-head m6"></div>
                <div class="archive-head m7"></div>
                <div class="archive-head m8"></div>
            </div>
            <div id="word-container">
                <img src="fex/archive/1_word.png" />
                <img src="fex/archive/2_word.png" />
                <img src="fex/archive/3_word.png" />
                <img src="fex/archive/4_word.png" />
                <img src="fex/archive/5_word.png" />
                <img src="fex/archive/6_word.png" />
                <img src="fex/archive/7_word.png" />
                <img src="fex/archive/8_word.png" />                
            </div>
            <div id="archive-container">
                <img src="fex/archive/1.png" />
                <img src="fex/archive/2.png" />
                <img src="fex/archive/3.png" />
                <img src="fex/archive/4.png" />
                <img src="fex/archive/5.png" />
                <img src="fex/archive/6.png" />
                <img src="fex/archive/7.png" />
                <img src="fex/archive/8.png" />
            </div>
        </div>
        <div class="screen" id="team" >
            <h1>你的加入，续写着“强者恒强”的真相</h1>
            <div id="team-container"></div>
            <div id="drawing-layer"></div>
            <div id="dialog"></div>
            <div class="nav prev"></div>
            <div class="nav next"></div>
        </div>
        <div class="screen" id="contact" >
            <div id="github">
                <div class="cat"></div>
                <div class="line"></div>
                <div class="icons"></div>
                <div class="url url0">
                    <a href="https://github.com/baidufe" target="_blank">https://github.com/baidufe</a>
                </div>
                <div class="url url1">
                    <a href="https://github.com/uxrp" target="_blank">https://github.com/uxrp</a>
                </div>
                <div class="url url2">
                    <a href="https://github.com/fis-dev" target="_blank">https://github.com/fis-dev</a>
                </div>
                <div class="url url3">
                    <a href="https://github.com/gmuteam" target="_blank">https://github.com/gmuteam</a>
                </div>
                <div class="url url4">
                    <a href="https://github.com/ueditor" target="_blank">https://github.com/ueditor</a>
                </div>
            </div>
            <div id="weixin">
                <h1>关注我们</h1>
                <img src="fex/weixin.png" class="code" title="扫描二维码，关注BaiduFE" />
                <p>微信号：BaiduFE</p>
            </div>
        </div>
        <div class="screen" id="case">            
            <div class="case-container">         
                <div class="case-control">
                    <a class="return-button">返回</a>
                    <h1>精彩案例</h1>
                </div>
                <div class="case-content">
                    
                </div>
            </div>
        </div>
    </div>
</body>
<script>
    
</script>
</html>