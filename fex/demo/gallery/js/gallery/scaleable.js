// var Hammer = require( "lib/hammer" ),
    // Dispatcher = require( "utils/dispatcher" );
/**
 *  @desc scaleable 手势缩放
 *  @param {Object} options
 *  @param {Function} options.onTransformStart
 *  @param {Function} options.onTransform
 *  @param {Function} options.onTransformEnd
 *  @param {Function} options.onScale
 *  @param {Function} options.onDoubleTap
 *  @param {Boolean} options.doubleTapZoomIn
 *  @param {Boolean} options.doubleTapZoomRestore
 *  @param {Number} options.doubleTapZoomScale
 *  @param {Number} options.min
 *  @param {Function} options.onMin
 *  @param {Number} options.max
 *  @param {Number} options.onMax
 *  @param {Boolean} options.dragableOnEnlarged
 *  @param {Boolean} options.onRestore
 */

$.fn.scaleable = function(options, Dispatcher) {
    var target = $(this),
        outerHandler = target.parent(),
        body = document.body,
        oriWidth,
        oriHeight,
        width = 0,
        height = 0,
        offset = {
            left: 0,
            top: 0
        },
        origin = {
            x: 0,
            y: 0
        },
        screenOrigin = {
            x: 0,
            y: 0
        },
        translate = {
            x: 0,
            y: 0
        },
        transforming = false,
        scale = 1,
        prevScale = 1,
        rotation = 0,
        prevRotation = 0,
        container,
        containerWidth,
        containerHeight,
        relativeScale = 1,
        oriGestureCenter = null,
        timer,
        draggableLeft = true,
        draggableRight = true,
        dragOffset = {
            x: 0,
            y: 0
        },
        hammer;
    options = $.extend({}, {
        max: 10,
        min: .5,
        doubleTapZoomScale: 2,
        doubleTapZoomIn: false,
        doubleTapZoomRestore: false,
        doubleTapRestoreHandler: null,
        dragableOnEnlarged: false,
        mousewheelSupport: false,
        minDragableScale: 1,
        container: null,
        slideOnScale: true,
        rotate: false
    }, options);
    
    function translateTo(pos, toScale){
        options.onScale && options.onScale.apply(target, arguments);
        
        // A
        var expr = "translate3d(" + pos.x + "px, " + pos.y + "px, 0) scale3d(" + toScale + ", " + toScale + ", 1)";
        
        // B
        // var expr = "translate(" + pos.x + "px, " + pos.y + "px) scale(" + toScale + ", " + toScale + ")";
        
        target.css('-webkit-transform', expr);
    }
    
    function transform(toScale, currentGestureCenter){
        // pinch transform
        
        var newHeight, newWidth;
        scale = toScale;
        newWidth = (target[0].width || target.width()) * scale;
        newHeight = (target[0].height || target.height()) * scale;
        origin.x = screenOrigin.x - offset.left - translate.x;
        origin.y = screenOrigin.y - offset.top - translate.y;
        translate.x += -origin.x * (newWidth - width) / newWidth;
        translate.y += -origin.y * (newHeight - height) / newHeight;
        
        // fix moved translate
        translate.x -= oriGestureCenter.pageX - currentGestureCenter.pageX;
        translate.y -= oriGestureCenter.pageY - currentGestureCenter.pageY;
        screenOrigin.x -= oriGestureCenter.pageX - currentGestureCenter.pageX;
        screenOrigin.y -= oriGestureCenter.pageY - currentGestureCenter.pageY;
        
        oriGestureCenter.pageX = currentGestureCenter.pageX;
        oriGestureCenter.pageY = currentGestureCenter.pageY;
        translateTo(translate, scale);
        width = newWidth;
        height = newHeight;
    }
    
    function updatePointCenter(x, y){
        if(x < offset.left){
            x = offset.left;
        }else if(x > offset.left + oriWidth ){
            x = offset.left + oriWidth;
        }
        
        if(y < offset.top){
            y = offset.top;
        }else if(y > offset.top + oriHeight ){
            y = offset.top + oriHeight;
        }
        
        return {
            x: x,
            y: y
        };
    }
    
    function scaleHandler(e){
        e.gesture && e.gesture.preventDefault();
        var point;
        switch(e.type) {
            case 'transformstart':
                target[0].style.webkitTransitionDuration = '0';
                target[0].style.webkitTransformOrigin = '0 0';
                screenOrigin = updatePointCenter(e.gesture.center.pageX, e.gesture.center.pageY - scrollY);
                options.onTransformStart && options.onTransformStart.call(target, e, prevScale, e.gesture.scale);
                transforming = true;
                oriGestureCenter = e.gesture.center;
                break;
            case 'transform':
                if(e.gesture.scale < 1 && prevScale * e.gesture.scale < options.min){
                    options.onMin && options.onMin.call(target);
                    return;
                }
                if(e.gesture.scale > 1 && prevScale * e.gesture.scale > options.max){
                    options.onMax && options.onMax.call(target);
                    return;
                }
                
                relativeScale = e.gesture.scale;
                transform(prevScale * e.gesture.scale, e.gesture.center); // , e.gesture.rotation+prevRotation);
                options.onTransform && options.onTransform.call(target, e, prevScale * e.gesture.scale);
                break;
            case 'transformend':
                target[0].style.webkitTransitionDuration = '400ms';
                target[0].style.webkitTransitionProperty = '-webkit-transform';
                prevScale = scale;
                prevRotation = rotation;
                options.onTransformEnd && options.onTransformEnd.call(target, e, scale, relativeScale);
                setTimeout(function(){
                    transforming = false;
                }, 50);
                oriGestureCenter = null;
                
                positionCorrection();
                break;
            case 'doubletap':
                Dispatcher.trigger('gallery:scaleable/doubletap');
                if(scale > 1){
                    options.doubleTapZoomRestore && restore();
                }else{
                    // forbid zoom on doubleTapRestoreHandler dbl tap
                    // if(options.doubleTapRestoreHandler && e.target == $(options.doubleTapRestoreHandler)[0]) return;
                    // else e.stopPropagation();
                    target[0].style.webkitTransitionDuration = '400ms';
                    target[0].style.webkitTransitionProperty = '-webkit-transform';
                    target[0].style.webkitTransformOrigin = '0 0';
                    
                    options.onTransformStart && options.onTransformStart.call(target, e, prevScale);
                    point = updatePointCenter(e.gesture.center.pageX, e.gesture.center.pageY - scrollY);
                    scaleTo(options.doubleTapZoomScale, point, e);
                    options.onTransformEnd && options.onTransformEnd.call(target, e, scale, options.doubleTapZoomScale);
                }
                break;
            case 'mousewheel':
                if(!options.mousewheelSupport || e.target != target[0]){
                    return;
                }
                target[0].style.webkitTransitionDuration = '400ms';
                target[0].style.webkitTransitionProperty = '-webkit-transform';
                point = updatePointCenter(e.pageX, e.pageY),
                    deltaScale = Math.abs(e.wheelDelta) / 100;
                if(e.wheelDelta < 0){
                    if(prevScale / deltaScale <= 1){
                        restore();
                    }else{
                        scaleTo(prevScale / deltaScale, point, e);
                    }
                }else{
                    scaleTo(prevScale * deltaScale, point, e);
                }
                break;
        }
    }
    
    function getCurrentPosInfo(){
        var offset = $(target).offset();
        
        return {
            width: $(target).width(),
            height: $(target).height(),
            containerWidth: container.width(),
            containerHeight: container.height(),
            left: offset.left,
            top: offset.top - scrollY
        };
    }
    
    function positionCorrection(){
        var posInfo = getCurrentPosInfo();
        
        if(posInfo.width > containerWidth){
            if(posInfo.left > 0){
                translate.x = -offset.left;
            }else if(Math.abs(translate.x) > posInfo.width - containerWidth + offset.left){
                translate.x = -(posInfo.width - containerWidth + offset.left);
            }
        }else{
            // move to center
            translate.x = - Math.max(posInfo.width - oriWidth, 0) / 2;
        }
        
        if(posInfo.height > containerHeight){
            if(posInfo.top > 0){
                translate.y = -offset.top;
            }else if(Math.abs(translate.y) > posInfo.height - containerHeight + offset.top){
                translate.y = -(posInfo.height - containerHeight + offset.top);
            }
        }else{
            // move to center
            translate.y = - Math.max(posInfo.height - oriHeight, 0) / 2;
        }
        
        translateTo(translate, scale);
    }
    
    function dragHandler(e){
        e.gesture && e.gesture.preventDefault();
        // e.gesture && e.gesture.stopPropagation();
        if(transforming || (e.gesture && e.gesture.deltaX == 0 && e.gesture.deltaY == 0) || scale <= options.minDragableScale){
            return;
        }
        function move(factor){
            // factor = factor || 1;    // constant velocity, but seems like more smooth
            if(!e.gesture){
                return;
            }
            factor = factor ? e.gesture.velocityX * factor : 1;
            var posInfo = getCurrentPosInfo(),
                xMovement = true,
                newX = e.gesture.deltaX * factor + translate.x,
                newY = e.gesture.deltaY * factor + translate.y,
                tolerance = 250;
            
            if((e.gesture.deltaX > 0 && !draggableRight) || (e.gesture.deltaX < 0 && !draggableLeft)){
                xMovement = false;
            }
            
            // x
            if(xMovement){
                dragOffset.x = newX;
                // 宽度小于容器宽度时， 不能拖动....
                if(posInfo.width < containerWidth){
                    dragOffset.x = translate.x;
                }else{
                    if(dragOffset.x > containerWidth / 2 + target[0].width / 2 - tolerance){
                        dragOffset.x = containerWidth / 2 + target[0].width / 2 - tolerance;
                    }
                    if(dragOffset.x < -(width + offset.left - tolerance)){
                        dragOffset.x = -(width + offset.left - tolerance);
                    }
                }
            }
            
            // y
            dragOffset.y = newY;
            if(posInfo.height < containerHeight){
                dragOffset.y = translate.y;
            }else{
                if(dragOffset.y > containerHeight / 2 + target[0].height / 2 - tolerance){
                    dragOffset.y = containerHeight / 2 + target[0].height / 2 - tolerance;
                }
                if(dragOffset.y < -(height + offset.top - tolerance)){
                    dragOffset.y = -(height + offset.top - tolerance);
                }
            }
            
            translateTo(dragOffset, scale);
        }

        switch(e.type) {
            case 'dragstart':
                var posInfo = getCurrentPosInfo();
                
                // dragOffset.x = 0;
                dragOffset.y = 0;
                if(options.slideOnScale){
                    if(e.gesture.deltaX < 0){
                        // to left
                        if(Math.abs(translate.x) >= posInfo.width - containerWidth + offset.left){
                            draggableLeft = false;
                            dragOffset.x = translate.x;
                            return;
                        }
                    }else{
                        // to right
                        if(posInfo.left >= 0){
                            draggableRight = false;
                            dragOffset.x = translate.x;
                            return;
                        }
                    }
                }
                dragOffset.x = 0;
                
                break;
            case 'drag':
                move();
                target[0].style.webkitTransitionDuration = '0ms';
                target.css('-webkit-transform-origin', '0 0');
                break;
            case 'dragend':
                if(draggableLeft && draggableRight){
                    translate.x = dragOffset.x;
                }
                translate.y = dragOffset.y;
                
                target[0].style.webkitTransitionDuration = '400ms';
                target[0].style.webkitTransitionProperty = '-webkit-transform';
                positionCorrection();

                draggableLeft = true;
                draggableRight = true;
                break;
            case 'swipe':
                // move(3);
                // positionCorrection();
                break;
        }
    }
    
    function restore(noAnim){
        if(noAnim){
            target[0].style.webkitTransitionDuration = '0s';
        }
		target[0].style.webkitTransformOrigin = '0 0';
        translateTo({
            x: 0,
            y: 0
        }, 1);
        scale = 1;
        prevScale = 1;
        translate.x = 0;
        translate.y = 0;
        prevRotation = 0;
        width = target[0].width;
        height = target[0].height;
        options.onRestore && options.onRestore();
    }
    
    function scaleTo(toScale, point, e){
        var originWidth = target[0].width,
            originHeight = target[0].height,
            newWidth = originWidth * toScale,
            newHeight = originHeight * toScale,
            currentCenterX = offset.left + originWidth / 2,
            currentCenterY = offset.top + originHeight / 2,
            translateX = toScale * (point.x - currentCenterX) + (newWidth - originWidth) /2,
            translateY = toScale * (point.y - currentCenterY) + (newHeight - originHeight) / 2;
        translateTo({
            x: -translateX,
            y: -translateY
        }, toScale);
        scale = toScale;
        prevScale = toScale;
        translate.x = -translateX;
        translate.y = -translateY;
        width = newWidth;
        height = newHeight;
        options.onTransformEnd && options.onTransformEnd.call(target, e, scale);
    }
    
    function setTargetInfo(ele){
        container = options.container ? $(options.container) : $(ele[0].offsetParent);
        var containerPaddingH = parseInt(getComputedStyle($(container)[0]).paddingLeft, 10),
            containerPaddingV = parseInt(getComputedStyle($(container)[0]).paddingTop, 10);
        containerWidth = container.width() - containerPaddingH * 2;
        containerHeight = container.height() - containerPaddingV * 2;
        width  = oriWidth = ele.width();
        height = oriHeight = ele.height();
        offset.left = ele.offset().left - container.offset().left - containerPaddingH;
        offset.top = ele.offset().top - container.offset().top - containerPaddingV;
        hammer = Hammer(outerHandler[0], {
        // hammer = Hammer(target[0], {
            /*
            prevent_default: true,
            scale_treshold: 0,
            drag_min_distance: 10,
            */
            swipe_velocity: 1.3
        });
    
        hammer.on('transformstart transform transformend', scaleHandler);
        options.doubleTapZoomIn && hammer.on('doubletap mousewheel', scaleHandler);
        options.dragableOnEnlarged && hammer.on('dragstart drag dragend swipe', dragHandler);
    }
    
    function init(){
        // return;
        if(target[0].nodeName.toLowerCase() == 'img'){
            // hack for transition of gallery page
            if($('#gallery').width() != $(body).width() || $(target).width() == 0 ){
                // retry, after a timeout
                timer = setTimeout(function(){
                    init();
                }, 50);
            }else{
                // image load complete + transitionEnd + animationEnd + page's transitionEnd
                setTargetInfo($(target));
            }
        }else{
            setTargetInfo($(target));
        }
        
    }
    
    // init();
    
    return {
        init: init,
        getScale: function(){
            return scale;
        },
        restore: restore,
        scaleTo: scaleTo,
        setOption: function(opt){
            $.extend(options, opt);
        },
        getOption: function(k){
            return options[k];
        },
        reset: function(){
            init();
        },
        canSlide: function(deltaX){
            if(scale <= 1){
                return true;
            }

            var posInfo = getCurrentPosInfo();
            if(posInfo.width < containerWidth){
                return true;
            }
            
            if(options.slideOnScale){
                if(deltaX > 0 && !draggableRight){
                    return 'right';
                }else if(deltaX < 0 && !draggableLeft){
                    return 'left';
                }
            }
            return false;
        },
        target: target,
        destroy: function(){
            restore();
            try{
                hammer.off('transformstart transform transformend', scaleHandler);
                hammer.off('doubletap mousewheel', scaleHandler);
                hammer.off('dragstart drag dragend swipe', dragHandler);
                delete target[0].dataset.hammer;
            }catch(e){
                // ignore uninstalled error
            }
            clearTimeout(timer);
        }
    };
};
