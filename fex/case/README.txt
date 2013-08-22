# Case 约定

* 所有的case都放在cases目录下

* 每个case建立一个目录，可以有自己的样式表和脚本

* 每个case的展示页为其目录的index.html

* 每个case的缩略图为其目录下的preview.png

* 每个case必须指定其类型（类型，取值为data|tool|end|case）其中取值为case的case会在案例中出现，如下：

    <meta name="case-type" content="data">

* 每个case必须指定其简介文本，如下：

    <meta name="case-desc" content="利用端技术实现的流畅和贴心的人机交互的照片查看功能">    

* 每个case可以指定其标签用于给用户检索（推荐），如下：

    <meta name="case-tags" content="移动 精致 体验">

* 每个case可以指定其排序优先级，值越高越排在前面（不指定都认为是0），如下：

    <meta name="case-level" content="5">

* list.php可以查看case是否正确被识别

    * 可以添加参数?topic=$_topic根据topic筛选case

    * 可以添加参数?a=maxlevel获取当前所有case排序优先值的最大值，

* show.php可以查看具体case，url参数为?name=$casename

    * 可以添加参数?iframe=true来输出适合嵌入到iframe的版本
