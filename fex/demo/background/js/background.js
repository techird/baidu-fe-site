/**
 * 
 */
void function(exports){
	exports.background = exports.background || {};
	exports = exports.background;
	var container; 
	var initImgWidth, initImgHeight, imgWidth, imgHeight, bodyWidth, bodyHeight, mode, url;
	var xBase, yBase, diffX, diffY, landscapeUrl, portraitUrl;
	var lastAlpha, lastBeta, lastGamma;
	var diffAlpha, diffBeta, diffGamma;
	var xScope, yScope, inDrag;
	
	var body = $( "body" );
	var abs = Math.abs;
	
	// 图片尺寸定义项，以横屏为主
	initImgWidth = 1280;
	initImgHeight = 1024;
	
	imgWidth = initImgWidth;
	imgHeight = initImgHeight;
	
	var frame = function( fn, time, min ){
	    var start, end, pRate, lastRate, endCb, interval;
	
	    start = new Date().getTime();
	    end = start + time;
	    pRate = 1 / (min || 5);
	    lastRate = 0;
	    
	    interval = setInterval(function(){
	        var now, rate;
	        
	        now = new Date().getTime();
	        rate = (now - start) / time;
	        
	        if(rate > lastRate + pRate)
	            rate = lastRate + pRate;
	        
	        lastRate = rate;
	        
	        if(rate < 1)
	            fn(rate);
	        else{
	            clearInterval(interval);
	            fn(1);
	            endCb && endCb();
	        }
	    }, 1);
	
	    return {
	        then: function(fn){
	            endCb = fn;
	        },
	
	        clear: function(){
	            clearInterval( interval );
	        }
	    }
	};
	
	var veryDifferent = function( v1, v2 ){
	    if( abs( v1 - v2 ) < 180 )
	        return 0;
	    if( v1 < v2 )
	        return -1;
	    return 1;
	};
	
	var setXY = function(){
	    var lastX, lastY;
	    return function( x, y ){
	        if( x === lastX && y === lastY )
	            return;
	
	        lastX = x;
	        lastY = y;
	
	        container.css( "-webkit-transform", "translate3d(" + x + "px, " + y + "px, 0)" );
	        // container.css( "left", x ).css( "top", y );
	    }
	}();
	
	var initCalc = function(){
	
	    if( mode == "landscape" ){
	        imgWidth = initImgWidth;
	        imgHeight = initImgHeight;
	    }else if( mode == "portrait" ){
	        imgWidth = initImgHeight;
	        imgHeight = initImgWidth;
	    }
	
	    xBase = ( bodyWidth - imgWidth ) / 2;
	    yBase = ( bodyHeight - imgHeight ) / 2;
	    xScope = -xBase;
	    yScope = -yBase;
	    diffX = diffY = 0;
	    lastAlpha = lastBeta = lastGamma = undefined;
	    diffAlpha = diffBeta = diffGamma = 0;
	    setXY( xBase, yBase );
	};
	
	var calc = function( alpha, beta, gamma ){
	    var t;
	
	    t = veryDifferent( alpha, lastAlpha );
	
	    if( t == 0 ){
	        diffAlpha = alpha - lastAlpha;
	    }else if( t == 1 ){
	        diffAlpha = alpha - lastAlpha - 360;
	    }else if( t == -1 ){
	        diffAlpha = alpha - lastAlpha + 360;
	    }
	
	    diffBeta = beta - lastBeta;
	    diffGamma = gamma - lastGamma;
	
	    diffAlpha *= 2;
	    diffBeta *= 2;
	    diffGamma *= 2;
	
	    lastAlpha = alpha;
	    lastBeta = beta;
	    lastGamma = gamma;
	
	    if( mode == "landscape" ){
	        if( abs( gamma ) > 60 && abs( gamma ) < 120 )
	            diffX += xScope * diffAlpha / 90;
	        else
	            diffX += xScope * diffBeta / 90;            
	
	        diffY += -yScope * diffGamma / 180;
	    }else if( mode == "portrait" ){
	        if( abs( diffGamma ) > 50 ) // bad case
	            diffGamma = 0;
	        diffX += xScope * diffGamma / 90;
	        diffY += yScope * diffBeta / 90;
	    }
	
	    diffX = diffX > xScope ? xScope : diffX < -xScope ? -xScope : diffX;
	    diffY = diffY > yScope ? yScope : diffY < -yScope ? -yScope : diffY;
	
	    if( !inDrag )
	        setXY( xBase + diffX, yBase + diffY );
	};
	
	var deviceorientationEvent = function( e ){
	    var alpha, beta, gamma;
	
	    if( e.alpha === null )
	        return ;
	
	    alpha = e.alpha.toFixed( 0 ) * 1;
	    beta = e.beta.toFixed( 0 ) * 1;
	    gamma = e.gamma.toFixed( 0 ) * 1;
	
	    if( lastAlpha === undefined )
	        lastAlpha = alpha;
	
	    if( lastBeta === undefined )
	        lastBeta = beta;
	    
	    if( lastGamma === undefined )
	        lastGamma = gamma;
	
	    calc( alpha, beta, gamma );
	};
	
	// var devicemotionEvent = function( event ){
	//     var x = round( event.accelerationIncludingGravity.x );
	//     var y = round( event.accelerationIncludingGravity.y );
	//     var z = round( event.accelerationIncludingGravity.z );  
	//     document.title = [ x, y, z ].join( "      " );
	// };
	
	var setBackgroundImage = function(){
	    var styleText = [
	        "#background .a{ background-image: url('" + landscapeUrl + "'); }",
	        "#background .b{ background-image: url('" + portraitUrl + "'); }"
	    ].join( "" );
	
	    $( "head" ).append( "<style>" + styleText + "</style>" );
	};
	
	var exponential = function(index, offset, target, framesNum){
	    return (index == framesNum) ? offset + target : target * (-Math.pow(2, -10 * index / framesNum) + 1) + offset;
	}
	
	var scrollTimer;
	var resizeEvent = function(){
	    bodyWidth = body.width();
	    bodyHeight = body.height();
	    mode = bodyWidth > bodyHeight ? "landscape" : "portrait";
	    container.removeClass( "landscape portrait" ).addClass( mode );
	    initCalc();
	
	    // var nowLeft, nowTop;
	
	    // nowLeft = body[0].scrollLeft;
	    // // nowTop = body[0].scrollTop;
	
	    // scrollTimer && scrollTimer.clear();
	    // scrollTimer = frame( function( rate ){
	    //     body[0].scrollLeft = exponential( rate, nowLeft, - nowLeft, 1 );
	    //     // body[0].scrollTop = exponential( rate, nowTop, - nowTop, 1 );
	    // }, 800 );
	};
	
	// -webkit-transform-origin: 0 center;
	// -webkit-transform: rotateY(0deg);
	
	// var dragStartPoint = [], dragPoint = [], dragDiffPoint = [], dragAngle, dragMode, dragScope = 20;
	var diffXOnDragStart, diffYOnDragStart, diffXOnDragging, diffYOnDragging, centerXOnStartDrag, centerYOnStartDrag;
	
	var dragStartEvent = function( e ){
	    // var center = e.gesture.center;
	    // dragStartPoint[0] = center.pageX;
	    // dragStartPoint[1] = center.pageY;
	    inDrag = true;
	    diffXOnDragStart = diffX;
	    diffYOnDragStart = diffY;
	    diffXOnDragging = 
	    diffYOnDragging = 0;
	
	    var center = e.gesture.center;
	    centerXOnStartDrag = center.pageX;
	    centerYOnStartDrag = center.pageY;
	
	    container.removeClass( "dragEnd" ).addClass( "dragStart" );
	};
	
	var dragEndEvent = function( e ){
	    inDrag = false;
	    container.removeClass( "dragStart" ).addClass( "dragEnd" );
	    setTimeout( function(){
	        container.removeClass( "dragEnd" );
	    }, 5e2 );
	    // dragStartPoint.length = 0;
	    // dragPoint.length = 0;
	    // dragDiffPoint.length = 0;
	    // dragAngle = 0;
	    // dragMode = "";
	    // container.css( "-webkit-transform", "rotateY(0deg)" );
	};
	
	var dragEvent = function( e ){
	    var center = e.gesture.center;
	    var dx, dy, scope = 200;
	
	    dx = ( center.pageX - centerXOnStartDrag ) / 5;
	    dy = 0; //( center.pageY - centerYOnStartDrag ) / 5;
	
	    dx = dx > scope ? scope : dx < -scope ? -scope : dx;
	    dy = dy > scope ? scope : dy < -scope ? -scope : dy;
	
	    diffXOnDragging = diffXOnDragStart + dx;
	    diffYOnDragging = diffYOnDragStart + dy;
	
	    diffXOnDragging = diffXOnDragging > xScope ? xScope : diffXOnDragging < -xScope ? -xScope : diffXOnDragging;
	    diffYOnDragging = diffYOnDragging > yScope ? yScope : diffYOnDragging < -yScope ? -yScope : diffYOnDragging;
	
	    setXY( xBase + diffXOnDragging, yBase + diffYOnDragging );
	
	    // dragPoint[0] = center.pageX;
	    // // dragPoint[1] = center.pageY;
	    
	    // dragDiffPoint[0] = dragPoint[0] - dragStartPoint[0];
	
	    // if( dragDiffPoint[0] > 0 ){
	    //     if( dragMode != "right" ){
	    //         dragMode = "right";
	    //         container.css( "-webkit-transform-origin", "right center" );
	    //     }
	
	    //     dragAngle = -dragScope * abs( dragDiffPoint[0] ) / 100;
	
	    //     if( dragAngle < -dragScope )
	    //         dragAngle = -dragScope;
	    // }else if( dragDiffPoint[0] < 0 ){
	    //     if( dragMode != "left" ){
	    //         dragMode = "left";
	    //         container.css( "-webkit-transform-origin", "left center" );
	    //     }
	
	    //     dragAngle = dragScope * abs( dragDiffPoint[0] ) / 100;
	
	    //     if( dragAngle > dragScope )
	    //         dragAngle = dragScope;
	    // }else{
	                
	    // }
	
	    // container.css( "-webkit-transform", "rotateY(" + dragAngle + "deg)" );
	};
	
	exports.start = function(){
	    resizeEvent();
	    $( window ).on( "deviceorientation", deviceorientationEvent );
	    // $( window ).on( "devicemotion", devicemotionEvent );
	    $( window ).on( "resize", resizeEvent );
	
	    var next = container.next()[0];
	    Hammer( next ).on( "dragstart", dragStartEvent );
	    Hammer( next ).on( "drag", dragEvent );
	    Hammer( next ).on( "dragend", dragEndEvent );
	};
	
	exports.stop = function(){
	    $( window ).off( "deviceorientation", deviceorientationEvent );
	    // $( window ).off( "devicemotion", devicemotionEvent );
	    $( window ).off( "resize", resizeEvent );
	
	    var next = container.next()[0];
	    Hammer( next ).off( "dragstart", dragStartEvent );
	    Hammer( next ).off( "drag", dragEvent );
	    Hammer( next ).off( "dragend", dragEndEvent );
	
	    inDrag = false;
	};
	
	exports.load = function( url ){
	    var pm, img1, img2, onload;
	
	    pm = new promise;
	
	    img1 = new Image;
	    img2 = new Image;
	
	    onload = function(){
	        pm.resolve();
	        onload = null;
	    };
	
	    if( body.width() > body.height() )
	        img1.onload = onload;
	    else
	        img2.onload = onload;
	
	    img1.src = landscapeUrl = url + "-1.jpg";
	    img2.src = portraitUrl = url + "-2.jpg";
	
	    setBackgroundImage();
	
	    return pm;
	};
	
	exports.setup = function( el ){
	    container = $( el );
	};

}(Zepto);
