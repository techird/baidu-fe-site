<!DOCTYPE HTML>
<html>
<head>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <title>Baidu FE</title>

    <link rel="stylesheet" href="mobile.css"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
</head> 
<body>

    <div id="fex">
        <div class="front-face">
            <h1>FEX</h1>
            <h2>The best or nothing</h2>
        </div>
        <div class="back-face">
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

    <div id="top-nav">
        <div id="menu">
            <ul>
                <li screen="topic" class="s1" id="nav_start"><a href="#topic">技术</a></li>
                <li screen="archive" class="s2"><a href="#archive">大牛</a></li>
                <li screen="team" class="s3"><a href="#team">团队</a></li>
                <li screen="contact" class="s4"><a href="#contact">关注</a></li>
                <li screen="case" class="s5"><a href="#case">案例</a></li>
            </ul>
        </div>
    </div>
    
    <div id="stage">
        <div class="screen" id="topic" >
            <div class="topic-content">
                <h2 class="tool">平台工具</h2>
                <ul class="tool">
                    <li class="fis">
                        <h1>FIS</h1>
                        <p>前端集成解决方案</p>
                        <a class="show-case" href="case/show.php?name=fis" target="_blank">查看</a>
                    </li>
                    <li class="ueditor">
                        <h1>UEditor</h1>
                        <p>一套开源的在线HTML所见即所得的编辑器</p>
                        <a class="show-case" href="case/show.php?name=ueditor" target="_blank">查看</a>
                    </li>
                </ul>   
                <h2 class="data">数据监控</h2>
                <ul class="data">
                    <li class="speed">
                        <h1>Speed</h1>
                        <p>集监控、分析、优化于一体的性能监控</p>
                        <a class="show-case" href="case/show.php?name=speed" target="_blank">查看</a>
                    </li>
                    <li class="uxrp">
                        <h1>UXRP</h1>
                        <p>让用户数据来更好的帮助你的产品</p>
                        <a class="show-case" href="case/show.php?name=uxrp" target="_blank">查看</a>
                    </li>
                </ul>   
                <h2 class="end">端技术</h2>
                <ul class="end">
                    <li class="chassis">
                        <h1>Chassis</h1>
                        <p>以提高Webapp开发效率为目的的开发框架</p>
                        <a class="show-case" href="case/show.php?name=chassis" target="_blank">查看</a>
                    </li>
                    <li class="gmu">
                        <h1>GMU</h1>
                        <p>基于Zepto并且面向移动端的UI组件库，价值在于为移动端快速开发提供稳定、丰富的UI组件。</p>
                        <a class="show-case" href="case/show.php?name=gmu" target="_blank">查看</a>
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
        </div>
        <div class="screen" id="team" >
            <h1>你的加入，续写着“强者恒强”的真相</h1>
            <div id="team-container">
<?
    $data = file_get_contents('./member/data.json');
    $data = json_decode($data);
    $array = Array();
    foreach ( $data as $index => $person ) {
        if ( $index == 'length' || $index == '0' ) continue;
        $person['index'] = $index;
        $array[] = $person;
    }
    shuffle( $array );
    foreach ($array as $index => $person) {
?>
                <div class="team-member">
                    <div class="image" style="background-image: url(member/<?=$person['index']?>.png);"></div>
                    <h1><?=$person[0]?></h1>
                    <p><?=$person[1]?></p>
                </div>
<?
    }
?>
            </div>
        </div>
        <div class="screen" id="contact" >
            <div id="github">
                <h1>Git 仓库</h1>
                <div class="cat"></div>
                <div class="url">
                    <a href="https://github.com/baidufe" target="_blank">https://github.com/baidufe</a>
                    <a href="https://github.com/uxrp" target="_blank">https://github.com/uxrp</a>
                    <a href="https://github.com/fis-dev" target="_blank">https://github.com/fis-dev</a>
                    <a href="https://github.com/gmuteam" target="_blank">https://github.com/gmuteam</a>
                    <a href="https://github.com/ueditor" target="_blank">https://github.com/ueditor</a>
                </div>
            </div>
            <div id="weixin">
                <h1>关注我们</h1>
                <img src="weixin.png" class="code" title="扫描二维码，关注BaiduFE"></img>
                <p>微信号：BaiduFE</p>
            </div>
        </div>
        <div class="screen" id="case">            
            <div class="case-container"> 
<?
    require('case/list.php');    

    function caseOnly($case) {
        return $case['topic'] == 'cases';
    }
    function sortCase($c1, $c2) {
        return $c2['level'] - $c1['level'];
    }
    $list = listCases(getcwd().'/case');
    $list = array_filter($list, caseOnly);
    uasort($list, sortCase);
    foreach ($list as $name => $case) {
?>
                <div class="case">
                    <h1><?=$name?></h1>
                    <p><?=$case['desc']?></p>
                    <!-- <img src="case/cases/<?=$name?>/preview.png" /> -->
                    <a class="case-link" target="_blank" href="case/show.php?name=<?=$name?>">查看</a>
                </div>
<? } ?>
            </div>
        </div>
    </div>

    <script type="text/javascript">
        var navElem = document.getElementById('top-nav');
        var navTop = navElem.offsetTop;
        var nav_start = document.getElementById('nav_start');
        var halfHeight = document.documentElement.clientHeight * 0.5;
        document.onscroll = function (e) {
            var top = document.body.scrollTop;
            if(top >= navTop) navElem.classList.add('fixed');
            else navElem.classList.remove('fixed');

            var elem, located = false;
            var nav = nav_start;
            while(nav) {
                elem = document.getElementById(nav.getAttribute('screen'));
                if( !located 
                    && elem.offsetTop < top + halfHeight
                    && elem.offsetTop + elem.clientHeight > top + halfHeight) {
                    nav.classList.add('current');
                    located = true;
                } else {
                    nav.classList.remove('current');
                }
                nav = nav.nextElementSibling;
            }
        }
        window.onhashchange = function(e) {
            e && e.preventDefault();
            var hash = window.location.hash.substr(1);
            var elem = document.getElementById(hash);
            if(elem) {
                document.body.scrollTop = elem.offsetTop - 60;
            }
        }
    </script>
</body>
</html>