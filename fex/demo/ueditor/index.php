<!DOCTYPE HTML>
<html>
<head>
    <title>Ueditor Demo</title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
    <script type="text/javascript" charset="utf-8" src="./ueditor.config.js"></script>
    <script type="text/javascript" charset="utf-8" src="./ueditor.all.js"></script>
    <script type="text/javascript" charset="utf-8" src="./lang/zh-cn/zh-cn.js"></script>
    <style type="text/css">
		#main{
			width:1024px;
			margin:0px auto;
			font-family:微软雅黑,Microsoft Yahei;
		}
		h1{
			font-weight:normal;
		}
    </style>
</head>
<body>
<div id="main">
	<h1>Ueditor富文本编辑器  - 演示demo</h1>
    <script id="editor" type="text/plain" style="width:1024px;height:300px">Ueditor富文本编辑器</script>
</div>

</body>
<script type="text/javascript">
    var ue = UE.getEditor('editor');
</script>
</html>