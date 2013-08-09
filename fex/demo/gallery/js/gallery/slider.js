// var Hammer = require( "lib/hammer" ),
// Dispatcher = require( "utils/dispatcher" );
/**
 * @desc 划图 
 */
$.fn.slider = function(options, Dispatcher){
    var element = $(this),
    container,
    body = document.body,
    panes,
    paneWidth,
    paneLength,
    panePadding,
    currentIndex = -1,
    dragMinDistance = 10,
    oldIndex = -1,
    isSliding= false,
    loadingHTML = '<span class="loading"></span>',
    absSaver = {
        /** absIndex: li **/
    },
    relativeSaver = {
        /** absIndex: relativeIndex **/
    },
    _options = {
        initIndex: 0,
        lengthLimit: 3,
        dampingFactor: .2,
        data: {}
    },
    enabled = false,
    operable = true,
    events = 'release drag swipeleft swiperight mousedown dragstart transform touchstart';
    options = $.extend({}, _options, options);

    var paneHelper = {
        lastRenderedAbsIndex: -1,
        add: function(absIndex){
            if(absIndex < 0){
                return;
            }
            // if(options.data[absIndex]){
                for(var relativeIndex = 0; relativeIndex < paneLength; relativeIndex++){
                    var item = panes[relativeIndex];
                    if(item.dataset.index == -1){
                        // $(item).html(options.data[absIndex]);
                        $(item).html(loadingHTML);
                        item.dataset.index = absIndex;
                        absSaver[absIndex] = item;
                        relativeSaver[absIndex] = relativeIndex;
                        break;
                    }
                }
            // }
        },
        inView: function(absIndex){
            return absSaver.hasOwnProperty(absIndex);
        },
        getInViewAbsIndex: function(){
            return this.lastRenderedAbsIndex;
        },
        render: function(absIndex, timing){
            absIndex = +absIndex;
            if(this.lastRenderedAbsIndex == absIndex){
                return;
            }

            if(timing == 'end'){
                var thisPaneIndex = this.getRelativeIndex(absIndex),
                    thisPane = this.getPane(absIndex),
                    relativeCounter = 0,
                    newList,
                    i;

                if(thisPaneIndex == 0){
                    // 0, to right
                    // debugger;
                    $(this.getPane(absIndex + 2)).remove();
                    newList = $('<li style="width:'+paneWidth+'px" data-index="'+(absIndex-1)+'"></li>');
                    // newList.append(options.data[absIndex-1]);
                    newList.append(loadingHTML);
                    absSaver = {};
                    relativeSaver = {};
                    if(absIndex > 0){
                        newList.insertBefore(thisPane);
                    }

                    for(i = absIndex - 1; i < absIndex+2; i++){
                        if(i < 0) {
                            continue;
                        }
                        absSaver[i] = $('li', container).eq(relativeCounter)[0];
                        relativeSaver[i] = relativeCounter++;
                    }
                    this.updateInfo();
                    this.lastRenderedAbsIndex = absIndex;
                    moveTo(this.getRelativeIndex(absIndex) ,false, false);
                }else{
                    // 2, to left
                    $(this.getPane(absIndex - 2)).remove();
                    newList = $('<li style="width:'+paneWidth+'px" data-index="'+(absIndex+1)+'"></li>');
                    // newList.append(options.data[absIndex+1]);
                    newList.append(loadingHTML);
                    absSaver = {};
                    relativeSaver = {};
                    if(absIndex < options.data.length - 1){
                        newList.insertAfter(thisPane);
                    }
                    
                    for(i = absIndex - 1; i < absIndex+2; i++){
                        if(i >= options.data.length){
                            break;
                        }
                        absSaver[i] = $('li', container).eq(relativeCounter)[0];
                        relativeSaver[i] = relativeCounter++;
                    }
                    this.updateInfo();
                    this.lastRenderedAbsIndex = absIndex;
                    moveTo(this.getRelativeIndex(absIndex) ,false, false);
                }
                return;
            }
            
            
            if(timing != 'end'){
                oldIndex = this.getAbsIndex(currentIndex);
            }
            var median = Math.ceil(options.lengthLimit / 2),
                min = absIndex - median + 1,
                max = absIndex + median,
                paneIndex = 0,
                // 当前视口中图片的绝对索引，用以恢复其位置
                currentActiveAbsIndex = this.getAbsIndex(currentIndex);
            // is NaN on init
            if(isNaN(currentActiveAbsIndex)){
                currentActiveAbsIndex = options.initIndex;
            }
            // reset saver before render;
            absSaver = {};
            relativeSaver = {};
            
            if(min < 0){
                min = 0;
            }
            if(max > options.data.length){
                max = options.data.length;
            }
            var step = max - min;            
            
            this._redundancyCheck();
            
            // add
            for(;min < max; min++){
                var resetPane = $('li', container).eq(paneIndex),
                    resetPaneAbsIndex = resetPane[0].dataset.index;
                resetPane.empty();
                resetPane[0].dataset.index = -1;
                paneIndex++;
                paneHelper.add(min);
            }
            this._deficiencyCheck(options.lengthLimit - step);
            
            this.updateInfo();
            this.lastRenderedAbsIndex = absIndex;
            
            if(timing == 'end'){
                moveTo(this.getRelativeIndex(currentActiveAbsIndex) ,false, false);
            }
            
        },
        _redundancyCheck: function(){
            var size = $('li', container).size();
            if(size < options.lengthLimit){
                var len = options.lengthLimit - size,
                    i = 0;
                for(; i < len; i++){
                    container.append('<li style="width:'+paneWidth+'px"></li>');
                }
                this.updateInfo();
            }
        },
        _deficiencyCheck: function(needless){
            var size = $('li', container).size(),
                i = 0;
            for(; i < needless; i++){
                $('li', container).eq(size - 1 - i).remove();
                this.updateInfo();
            }
        },
        getPane: function(absIndex){
            return absSaver[absIndex];
        },
        getAbsIndex: function(relativeIndex){
            var item = $('li', container).eq(relativeIndex)[0];
            return item ? +item.dataset.index : null;
        },
        getRelativeIndex: function(absIndex){
            return relativeSaver[absIndex];
        },
        updateInfo: function(){
            panes = $("li", element);
            paneLength = panes.length;
            // paneWidth = element.width();
            paneWidth = $(document).width();
            panePadding = parseInt(getComputedStyle(panes[0]).paddingLeft, 10);
            panes.each(function() {
                $(this).width(paneWidth);
            });
            container.width(paneWidth*paneLength + (panePadding * 2) * paneLength);
        },
        init: function(absIndex){
            var li = '', i = 0;
            if(container){
                container.empty();
            }else{
                element.append('<ul />');
                container = $("ul", element);
            }
            for(i = 0 ; i < options.lengthLimit; i++){
                li += '<li style="width:'+container.width()+'px">'+loadingHTML+'</li>';
            }
            container.append($(li));
            this.updateInfo();
            paneHelper.render(absIndex);
            
            if(absIndex != -1){
                Dispatcher.trigger('gallery:slider/afterSwitch', absIndex, oldIndex);
            }else{
                moveTo(0, false, false);
            }
        }
    };
    
    function reset(){
        paneHelper.updateInfo();
        moveTo(currentIndex, false);
    }
    
    function afterWebkitTransitionEndHandler(e){
        if(e.propertyName != '-webkit-transform' || element.width() != $(body).width() || e.target != container[0]){
            return;
        }
        operable = true;
        var beforeAbsIndex = paneHelper.getInViewAbsIndex();
        var newAbsIndex = paneHelper.getAbsIndex(currentIndex);
        paneHelper.render(newAbsIndex, 'end');
        var afterAbsIndex = paneHelper.getInViewAbsIndex();
        if(beforeAbsIndex != afterAbsIndex){
            Dispatcher.trigger('gallery:slider/afterSwitch', newAbsIndex, oldIndex);
        }
        hiddenSiblings();
    }
    
    /**
     * initial
     */
    function init(total) {
        options.data.length = total;
        paneHelper.init(options.initIndex);
        enable();
        container.on('webkitTransitionEnd', afterWebkitTransitionEndHandler);
        Hammer(element[0], {
            prevent_default: true,
            scale_treshold: 0,
            drag_min_distance: dragMinDistance,
            swipe_velocity: .1
        }).on(events, eventHandler);
    }

    function reInit(absIndex){
        currentIndex = -1;
        oldIndex = -1;
        absSaver = {};
        relativeSaver = {};
        paneHelper.init(absIndex);
    }

    function moveTo (relativeIndex, animate, trigger) {
        relativeIndex = Math.max(0, Math.min(relativeIndex, paneLength-1));
        if(animate && (currentIndex != relativeIndex)){
            Dispatcher.trigger('gallery:slider/beforeSwitch', paneHelper.getAbsIndex(relativeIndex));
            operable = false;
        }
        
        setContainerOffset(-relativeIndex * paneWidth - (panePadding * ((relativeIndex+1) * 2 - 1)), animate);
        if(currentIndex == relativeIndex){
            return;
        }
        currentIndex = relativeIndex;
        
    }

    function hiddenSiblings(){
        var currentPane = $(paneHelper.getPane(paneHelper.getAbsIndex(currentIndex)));
        currentPane.css('visibility', 'visible');
        currentPane.next().css('visibility', 'hidden');
        currentPane.prev().css('visibility', 'hidden');
    }
    
    function visibleSiblings(dir){
        var currentPane = $(paneHelper.getPane(paneHelper.getAbsIndex(currentIndex)));
        currentPane[dir]().css('visibility', 'visible');
    }
    
    function setContainerOffset(offset, animate) {
        container.removeClass("animate");
        if(animate) {
            oldIndex = paneHelper.getAbsIndex(currentIndex);
            container.addClass("animate");
        }
        // container.css("-webkit-transform", "translate3d("+ offset +"px, 0, 0)");
       	container.css("-webkit-transform", "translate("+ offset +"px, 0)");
        // container.css("left", offset + "px");
        // container.css('-webkit-transform', 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,' + offset + ',' + 0 + ',0,1)');
    }
    function immovableHint(pane){
        try{
            Tip.showWating({
                icon: false,
                text: currentIndex == 0 ? '木有上一页了噢~' : '木有下一页了噢~',
                maxTime:3000
            });
        }catch(e){}
        finally{
            pane = pane || paneHelper.getPane(paneHelper.getAbsIndex(currentIndex));
            $(pane).addClass('gallery-slider-immovable');
            $(pane).one('webkitAnimationEnd', function(){
                $(this).removeClass('gallery-slider-immovable');
            });
        }
    }
    
    function next() {
        visibleSiblings('next');
        return moveTo(currentIndex+1, true);
    }
    
    function prev() {
        visibleSiblings('prev');
        return moveTo(currentIndex-1, true);
    }
    
    var release = false;
    // event handler
    function eventHandler(ev) {
        ev.gesture && ev.gesture.preventDefault();
        if(!operable || !enabled){
            return;   // 不可操作状态: 1)动画中   
        }
        
        if(options.onBeforeDrag && ev.gesture && isSliding == false){
            var returnValue = options.onBeforeDrag(paneHelper.getAbsIndex(currentIndex), ev);
            if( (returnValue === false) || (returnValue == 'right' &&  ev.gesture.deltaX < 0) || (returnValue == 'left' &&  ev.gesture.deltaX > 0) ){
                // can't slide
                return;
            }else{
                // can slide
                release = false;
                isSliding = true;
            }
        }
        switch(ev.type) {
            case 'dragstart':
                isSliding = true;
                ev.gesture.stopPropagation();
                dir = ev.gesture.deltaX < 0 ? 'next' : 'prev';
                visibleSiblings(dir);
                break;
            case 'touchstart':
                if(!ev.touches || ev.touches.length == 1){
                    release = false;
                }
                break;
            case 'drag':
                release = true;
                var pane_offset = -currentIndex * paneWidth,
                    drag_offset = ev.gesture.deltaX,
                	dragMinDistanceFix = dir == "prev" ? -dragMinDistance : +dragMinDistance;
                
				ev.gesture.stopPropagation();
                if((currentIndex == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
                    (currentIndex == paneLength-1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
                    drag_offset *= options.dampingFactor;
                    var pane = paneHelper.getPane(paneHelper.getAbsIndex(currentIndex));
                    immovableHint(pane);
                }else{
                	drag_offset += dragMinDistanceFix;
                    setContainerOffset(drag_offset + pane_offset - (panePadding * ((currentIndex+1) * 2 - 1)));
                }
                break;
            case 'release':
                isSliding = false;
                if(!release){
                    return;
                }
                
                ev.gesture.stopPropagation();
                
                // FIXME hack swipe
                if(ev.gesture.velocityX > .3){
                    if(ev.gesture.deltaX > 0){
                        prev();
                    }else{
                        next();
                    }
                    return;
                }

                if(Math.abs(ev.gesture.deltaX) > paneWidth/2) {
                    if(ev.gesture.direction == 'right') {
                        prev();
                    } else {
                        next();
                    }
                }
                else {
                    moveTo(currentIndex, true);
                }
                break;
        }
    }
    
    function enable(){
        if(enabled){
            return;
        }
        enabled = true;
        
    }
    function disable(){
        enabled = false;
    }
    
    function destroy(){
        Hammer(element[0]).off(events, eventHandler);
        container.off('webkitTransitionEnd', afterWebkitTransitionEndHandler);
    }
    
    return {
        next: next,
        prev: prev,
        hasNext: function(){
            var index = paneHelper.getAbsIndex(currentIndex);
            return index + 1 < options.data.length;
        },
        hasPrev: function(){
            var index = paneHelper.getAbsIndex(currentIndex);
            return index > 0;
        },
        first: function(){
            moveTo(0, true);
        },
        last: function(){
            moveTo(options.data.length - 1, true);
        },
        moveTo: function(absIndex, anim, notTrigger){
            absIndex = +absIndex;
            if(paneHelper.inView(absIndex)){
                oldIndex = paneHelper.getAbsIndex(currentIndex);
                paneHelper.render(absIndex);
                moveTo(+paneHelper.getRelativeIndex(absIndex), anim);
                (notTrigger !== false ) && !anim && Dispatcher.trigger('gallery:slider/afterSwitch', +absIndex, oldIndex);
            }else{
                paneHelper.render(+absIndex);
                moveTo(+paneHelper.getRelativeIndex(absIndex), anim);
                (notTrigger !== false ) && Dispatcher.trigger('gallery:slider/afterSwitch', +absIndex, oldIndex);
            }
            operable = true;
            hiddenSiblings();
        },
        setOption: function(opt){
            $.extend(options, opt);
            return this;
        },
        getOption: function(k){
            return options[k];
        },
        disable: disable,
        enable: enable,
        isEnable: function(){
            return enabled;
        },
        getCurrentIndex: function(){
            return paneHelper.getAbsIndex(currentIndex);
        },
        getCurrentPane: function(){
            return this.getPane(this.getCurrentIndex());
        },
        inView: function(index){
            return paneHelper.inView(index);
        },
        getPane: function(absIndex){
            return paneHelper.getPane(absIndex);
        },
        setData: function(data, len){
            len = len ? len : options.data.length;
            var result = {length: len};
            for(var i in data){
                if(data[i] != 0){
                    result[i] = loadingHTML;
                }
            }
            options.data = $.extend(options.data, result);
        },
        isPaneInView: function(pane){
            pane = $(pane)[0];
            var result = false;
            $('li', container).each(function(index, item){
                if(item === pane){
                    result = true;
                    return false;
                }
            });
            return result;
        },
        paneHelper: paneHelper,
        init: init,
        reInit: reInit,
        reset: reset,
        isSliding: function(){
            return isSliding;
        },
        afterResize: function(){
            reset();
            // redraw bug in safari
            var pane = $('li', container);
            pane.hide();
            setTimeout(function(){
                pane.show();
            }, 1);
        },
        immovableHint: immovableHint,
        destroy: destroy
    };
};
