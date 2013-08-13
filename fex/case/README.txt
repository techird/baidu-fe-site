# Case 约定

* 所有的case都放在cases目录下

* 每个case建立一个目录，可以有自己的样式表和脚本

* 每个case的展示页为其目录的index.html

* 每个case的缩略图为其目录下的preview.png

* 每个case需要指定元数据type（类型，取值为data|tool|end）、tags（标签）和desc（简要描述），添加的方法为在index.html中添加两个meta标签，如：

    <meta name="case-type" content="data">
    <meta name="case-tags" content="移动 精致 体验">
    <meta name="case-desc" content="利用端技术实现的流畅和贴心的人机交互的照片查看功能">

* list.php可以查看case是否正确被识别

* show.php可以查看具体case，url参数为?name=$casename