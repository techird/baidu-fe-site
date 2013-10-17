// ==UserScript==  
// @name         JSGear
// @version		 1.0.0
// @author       zjcqoo@gmail.com
// @namespace    https://github.com/EtherDream/JsGear
// @description  JavaScript Speed Gear
// @include      *
// ==/UserScript== 

var Gear = (function(fnST, fnCT, fnSI, fnCI, fnDt, global) {
	/**
	 * IE678:
	 *   => typeof window.setInterval == 'obecjt'
	 *   => window.setInterval = function(){...}	//错误
	 *
	 * 解决方法:
	 *   1. function setInterval(){}				//在全局定义setInterval函数
	 *   2. window.setInterval = function(){...}	//可以覆盖
	 */
	var execScript = window.execScript;
	var STD = !!window.addEventListener;

	function fixNative() {
		execScript('function setTimeout(){}function clearTimeout(){}function setInterval(){}function clearInterval(){}');
	}


	var iRate = 1;
	var iFreeFrame = 9e9;
	var iLast, iTick;

	var aQueue = [];
	var nQueue = 1;
	var iFlag = 0;


	function addQueue(code, delay, arg, repeat) {
		if (!code) {
			return;
		}

		// 参数类型验证
		delay = +delay || 0;

		if (delay < 1) {
			delay = 1;
		}

		// 添加任务队列
		aQueue[nQueue] =
			{code:code, delay:delay, arg:arg, repeat:repeat, sum:0, flag:iFlag};

		return nQueue++;
	}

	function delQueue(id) {
		if (id >= 0) {
			delete aQueue[id];
		}
	}

	function hook() {
		global.setTimeout = setTimeout;
		global.clearTimeout = clearTimeout;
		global.setInterval = setInterval;
		global.clearInterval = clearInterval;
		global.Date = Date;

		for (var i = 0; i < requestFrameName.length; i++) {
			global[requestFrameName[i]] = function(cb) {
				return setTimeout(cb, 16);
			}

			global[cancelFrameName[i]] = clearTimeout;
		}




		iLast = iTick = +new fnDt;
		tid = fnSI(onTimer, 1);
	}

	function unhook() {
		global.setTimeout = fnST;
		global.clearTimeout = fnCT;
		global.setInterval = fnSI;
		global.clearInterval = fnCI;
		global.Date = fnDt;

		for (var i = 0; i < requestFrameName.length; i++) {
			var k = requestFrameName[i];
			global[k] = requestFrameFn[k];
		}
	}

	function execute(task) {
		var code = task.code;

		if (typeof code == 'function') {
			if (execScript) {	// ie不支持参数传递
				code();
			}
			else {				// 支持多参数传递
				task.arg ?
					code.apply(global, task.arg) :
					code();
			}
		}
		else {
			if (execScript) {		// ie可选择脚本语言
				task.arg ?
					execScript(code, task.arg[0]) :
					execScript(code);
			} else {				// 全局执行
				global.eval(code);
			}
		}
	}


	function onTimer() {
		var cur = +new fnDt;
		var elapse = (cur - iLast) * iRate;


		for(var k in aQueue) {
			var task = aQueue[k];

			// 防止ie浏览器枚举时递归
			if (task.flag == iFlag) {
				continue;
			}

			// 计时器累加
			task.sum += elapse;

			if (task.repeat) {		// setInterval
				// 跳帧数
				var skip = (task.sum / task.delay) >> 0;

				// 最大跳帧数，防止卡死
				if (skip > 32) {
					skip = 32;
				}

				// 执行每一帧
				while (--skip >= 0) {
					execute(task);
				}

				// 剩余点数
				task.sum %= task.delay;
			}
			else {				// setTimeout
				if (task.sum >= task.delay) {
					execute(task);

					delete aQueue[k];
					continue;
				}
			}
		}

		iLast = cur;
		iTick += elapse;
		iFlag++;
	}


	/** 重定义时间函数 ***********************************/
	var SLICE = [].slice;

	function setTimeout(code, delay, arg) {
		if (arg) {
			arg = SLICE.call(arguments, 2);
		}
		return addQueue(code, delay, arg, false);
	}

	function clearTimeout(id) {
		delQueue(id);
	}

	function setInterval(code, delay, arg) {
		if (arg) {
			arg = SLICE.call(arguments, 2);
		}
		return addQueue(code, delay, arg, true);
	}

	function clearInterval(id) {
		delQueue(id);
	}


	var requestFrameName = [],
		requestFrameFn = {},
		cancelFrameName = [],
		cancelFrameFn = {};



	var REQUEST_FRAME = [
		'oRequestAnimationFrame',
		'mozRequestAnimationFrame',
		'webkitRequestAnimationFrame',
		'msRequestAnimationFrame',
		'requestAnimationFrame'
	];

	var CANCEL_FRAME = [
		'oCancelAnimationFrame',
		'mozCancelAnimationFrame',
		'webkitCancelAnimationFrame',
		'msCancelAnimationFrame',
		'cancelAnimationFrame'
	];

	for(var i = REQUEST_FRAME.length - 1; i >= 0; i--) {
		var k = REQUEST_FRAME[i];
		if (global[k]) {
			requestFrameName.push(k);
			requestFrameFn[k] = global[k];
		}

		k = CANCEL_FRAME[i];
		if (global[k]) {
			cancelFrameName.push(k);
			cancelFrameFn[k] = global[k];
		}
	}



	/** 重定义 Date ***********************************/
	function Date(y, m, d, h, min, s, ms) {
		if (this instanceof Date) {		// new Date(...)
			switch(arguments.length) {
			case 0:
				var cur = +new fnDt;
				iTick += (cur - iLast) * iRate;
				iLast = cur;
				return new fnDt(iTick);

			case 1: return new fnDt(y);
			case 2:	return new fnDt(y, m);
			case 3:	return new fnDt(y, m, d);
			case 4:	return new fnDt(y, m, d, h);
			case 5:	return new fnDt(y, m, d, h, min);
			case 6:	return new fnDt(y, m, d, h, min, s);
			default:return new fnDt(y, m, d, h, min, s, ms);
			}
		}
		else {							// Date()
			// ie678的Date()返回值里没有UTC+0800
			return STD ?
				new Date().toString() :
				new Date().toString().replace(/UTC.+ /, '');
		}
	}


	if (fnDt.now) Date.now = function() {
		var cur = fnDt.now();
		iTick += (cur - iLast) * iRate;
		iLast = cur;
		return Math.round(iTick);
	};

	Date.UTC = fnDt.UTC;
	Date.parse = fnDt.parse;
	Date.prototype = fnDt.prototype;



	// ==================================================
	// 导出接口
	// ==================================================
	var nativeFn = (typeof fnCT == 'object');

	function setup() {
		if (nativeFn) {
			fixNative();
		}
		hook();
	}

	function unsetup() {
		unhook();
	}

	function setRate(rate) {
		iRate = rate;
	}

	function pause() {
		iFreeFrame = 0;
	}

	function resume() {
		iFreeFrame = 9e9;
	}

	function next(count) {
		iFreeFrame = count || 1;
	}

	setup();

	return {
		setup: setup,
		unsetup: unsetup,
		setRate: setRate,
		pause: pause,
		resume: resume,
		next: next,

		rawSetTimeout: nativeFn? fnST : function() {return fnST.apply(global, arguments)},
		rawClearTimeout: nativeFn? fnCT : function() {return fnCT.apply(global, arguments)},
		rawSetInterval: nativeFn? fnSI : function() {return fnSI.apply(global, arguments)},
		rawClearInterval: nativeFn? fnCI : function() {return fnCI.apply(global, arguments)}
	};
})
(
	setTimeout,
	clearTimeout,
	setInterval,
	clearInterval,
	Date,
	this
);





(function() {
	/** UI  ************************************/
	var QUIRKS = ('BackCompat' == document.compatMode);
	var IE6 = /IE 6/.test(navigator.userAgent);
	var STD = !!window.addEventListener;
	var DE = document.documentElement;
	var BODY;


	var $bind = STD?
		function(e, n, f){e.addEventListener(n, f, false)} :
		function(e, n, f){e.attachEvent('on' + n, f)};
	
	var $unbind = STD?
		function(e, n, f){e.removeEventListener(n, f, false)} :
		function(e, n, f){e.detachEvent('on' + n, f)};
	

	function $extend(src, dst) {
		for(var k in src) {
			dst[k] = src[k];
		}
	}




	var TRAY_W = 48;
	var TRAY_H = 48;
	var RULE_OPA = 0.7;
	
	var iMaxLeft;
	var iMaxTop;
	
	var oTray, styTray;
	var oRule, styRule;
	var oMask, styMask;
	var iPercent = 1;
	
	var uDrag = {};
	var iX = 0;
	var iY = 0;
	
	var iRuleAlp = RULE_OPA;
	var oRuleAlp;
	var aRuleNum = [];
	
	var tidFade = -1;
	var tidNumUpdate = -1;

	
	var IMG_TRAY = 'http://www.etherdream.com/JSGear/gear.png';
	//var IMG_TRAY = 'gear.png';
	
	var UI_TRAY = {
		zIndex: 9999,
		position: 'fixed',
		overflow: 'hidden',
		width: '48px',
		height: '48px',
		
		background: 'url(' + IMG_TRAY + ')',
		font: 'normal bold 12px Tahoma',
		textAlign: 'center',
		color: '#C00000',
		
		cursor: 'move',
		MozUserSelect: 'none',
		WebkitUserSelect: 'none'
	};
	
	var UI_RULE = {
		display: 'none',
		zIndex: 9998,
		position: 'fixed',
		overflow: 'hidden',
		left: 0,
		height: '46px',
		
		background: '#AAA',
		border: '#EEE 1px solid',
		borderLeft: 'none',
		borderRight: 'none',

		font: 'normal bold 30px Tahoma',
		lineHeight: '46px',
		color: '#FFF',
		textAlign: 'center',

		cursor: 'move'
	};
	
	var UI_MASK = {
		display: 'none',
		zIndex: 9997,
		
		position: 'fixed',
		left: 0,
		top: 0,
		
		font: 'normal bold 180px Tahoma',
		color: '#C00000',
		textAlign: 'center',
		cursor: 'move'
	};

	var UI_NUM = {
		position: 'absolute',
		top: '1px',
		height: '44px'
	};
	
	


	function init() {
		var t = Gear.rawSetInterval(function() {
			BODY = document.body;
			if (BODY) {
				Gear.rawClearInterval(t);
				initUI();
			}
		}, 20);
	}


	function initUI() {
		oTray = document.createElement('div');
		oRule = document.createElement('div');
		oMask = document.createElement('div');

		styTray = oTray.style;
		styRule = oRule.style;
		styMask = oMask.style;
		
		BODY.appendChild(oRule);
		BODY.appendChild(oTray);
		BODY.appendChild(oMask);

		oTray.title = '拖动调整速度\n双击即可归零';

		// 尺
		for(var i = -10; i <= 10; ++i) {
			var num = document.createElement('div');
			var sty = num.style;
			var s;
			
			//
			// -10 ~ +10 刻度
			//
			if (i == 0) {
				num.innerHTML = '&clubs;';
			}
			else {
				if (i > 0) {
					s = '+' + i;
				} else {
					s = i;
				}

				num.innerHTML = '2<sup style="font-size:12px; vertical-align:top;">' + s + '</sup>';
			}
			
			$extend(UI_NUM, sty);
			
			sty.background = (i % 2) ? '#777' : '#555';
			
			oRule.appendChild(num);
			aRuleNum.push(num.style);
		}
		
		// 半透明对象
		if (STD) {
			oRuleAlp = styRule;
		}
		else {
			styRule.filter = 'alpha';
			oRuleAlp = oRule.filters.alpha;
		}

		updateRuleAlpha();
		
		// 界面样式
		$extend(UI_TRAY, styTray);
		$extend(UI_RULE, styRule);
		$extend(UI_MASK, styMask);


		if (IE6) {
			// 兼容：半透明
			styTray.background = '';
			styTray.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + IMG_TRAY +')';

			// 兼容：position=fixed
			styTray.position =
			styRule.position =
			styMask.position = 'absolute';
			
			attachEvent('onscroll', handleScroll);
		}

		// 界面事件
		$bind(window, 'resize', handleResize);
		//$bind(oTray, 'mouseover', handleTrayMouseOver);
		$bind(document, 'mouseup', handleTrayMouseUp);
		$bind(oTray, 'mousedown', handleTrayMouseDown);
		$bind(oTray, 'dblclick', handleTrayDblClick);
		$bind(oTray, 'selectstart', handleForbid);
		$bind(oTray, 'contextmenu', handleForbid);

		handleResize();
		reset();
	}


	function handleResize() {
		var W = QUIRKS? BODY.clientWidth : DE.clientWidth;
		var H = QUIRKS? BODY.clientHeight : DE.clientHeight;

		iMaxLeft = W - TRAY_W;
		iMaxTop = H - TRAY_H;

		// 托盘位置
		move(iMaxLeft * iPercent, iY);


		// 尺宽度
		var n = aRuleNum.length;
		var w = W / n;
		var i;

		styRule.width = W + 'px';
		w = ~~(w * 1e6) / 1e6;

		for (i = 0; i < n; ++i) {
			aRuleNum[i].width = w + 'px';
			aRuleNum[i].left = w * i + 'px';
		}

		// 遮挡层
		styMask.width = W + 'px';
		styMask.height =
		styMask.lineHeight = H + 'px';
	}


	// 支持 position:fixed
	function handleScroll() {
		var ox = DE.scrollLeft;
		var oy = DE.scrollTop;
		
		styTray.left = iX + ox + 'px';
		styTray.top =
		styRule.top = iY + oy + 'px';
		
		styMask.left = ox + 'px';
		styMask.top = oy + 'px';
	}



	function handleTrayMouseDown(e) {
		// 开始拖曳
		if (uDrag.on) return;
		uDrag.on = true;

		e = e || event;	
		uDrag.x = e.clientX - iX;
		uDrag.y = e.clientY - iY;

		$bind(document, 'mousemove', handleTrayMouseMove);
		
		// 显示尺
		styRule.display = 'block';
		iRuleAlp = RULE_OPA;
		updateRuleAlpha();
		Gear.rawClearInterval(tidFade);
		
		// 缓慢更新大字
		styMask.display = 'block';
		tidNumUpdate = Gear.rawSetInterval(handleUpdateNum, 100);

		// 禁止拖曳滚屏(std)
		handleForbid(e);
	}
	

	function handleTrayMouseMove(e) {
		if (!uDrag.on) return;

		e = e || event;
		move(e.clientX - uDrag.x, e.clientY - uDrag.y);
		
		// 禁止拖曳滚屏(ie678)
		handleForbid(e);
	}


	function handleTrayMouseUp() {
		if (!uDrag.on) return;
		uDrag.on = false;
		
		// 停止拖曳
		$unbind(document, 'mousemove', handleTrayMouseMove);

		// 尺-渐隐
		tidFade = Gear.rawSetInterval(handleFade, 16);

		// 停止更新大字
		Gear.rawClearInterval(tidNumUpdate);
		styMask.display = 'none';
	}
	
	
	function handleTrayDblClick() {
		reset();
	}
	
	
	function handleForbid(e) {
		if (STD) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
	}
	
	
	function handleFade() {
		iRuleAlp -= 0.08;
		
		if (iRuleAlp > 0) {
			updateRuleAlpha();
		} else {
			styRule.display = 'none';
			Gear.rawClearInterval(tidFade);
		}
	}
	
	
	function handleUpdateNum() {
		var pow = 20 * (iPercent - 0.5);

		var rate = Math.pow(2, pow);
		Gear.setRate(rate);

		// 格式化数字
		var s;
		if (rate >= 1000) {
			s = rate.toPrecision(4);
		} else if (rate >= 1) {
			s = rate.toPrecision(3);
		} else if (rate > 0.01) {
			s = rate.toPrecision(2);
		} else {
			s = rate.toFixed(4);
		}
			
		if (oMask.innerHTML != s) {
			oMask.innerHTML = s;
			oTray.innerHTML = s;
		}
	}
	
	
	function updateRuleAlpha() {
		// 0.1234
		iRuleAlp = ~~(iRuleAlp * 1e4) / 1e4;
		oRuleAlp.opacity = STD? iRuleAlp : iRuleAlp * 100;
	}


	function reset() {
		move(iMaxLeft / 2, iY);
		handleUpdateNum();
	}


	function move(x, y) {
		// 限定浮窗位置
		if (x < 0) {
			x = 0;
		}
		else if (x > iMaxLeft) {
			x = iMaxLeft;
		}

		if (y < 0) {
			y = 0;
		}
		else if (y > iMaxTop) {
			y = iMaxTop;
		}

		styRule.top =
		styTray.top = y + 'px';
		styTray.left = x + 'px';

		// 滑块比例
		iPercent = x / iMaxLeft;

		iX = x;
		iY = y;
		
		if (IE6) handleScroll();
	}
	
	init();
})();
