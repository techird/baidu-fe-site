//var Hammer = require( "lib/hammer" ),
//    Dispatcher = require( "utils/dispatcher" );
/**
 * @desc 缩略图 
 */
$.fn.thumbnail = function(options, Dispatcher){
    var wrapper = this,
        ul,
        max = 20,
        nodesLength,
        itemWidth,
        itemAmount,
        thumbnailWidth,
        containerWidth,
        img = $('img', ul),
        itemTap = true,
        currentIndex,
        currentOffset = 0,
        dampingFactor = .2,
        scroller = null,
        prevOffset = 0,
        dragOffset = 0,
        dataWaitingTimer,
        body = document.body,
        eventInstalled = false,
        _options = {
            initActive: -1,
            thumbnailPadding: 15,
            imageWidth: 100,
            imageHeight: 100,
            itemWidth: 115,
            iScroll: false,
            data: {}
        },
        events = 'webkitTransitionEnd drag swipe dragstart dragend tap mousewheel transform release touchend touchstart';
        options = $.extend({}, _options, options);
    
    var itemHelper = {
        
        getBoundaryInfo: function(offset){
            offset = arguments.length ? offset : currentOffset;
            var start = Math.max(Math.floor(-offset / itemWidth), 0),
                end = Math.min(Math.ceil((Math.abs(offset) + containerWidth) / itemWidth), itemAmount),
                median = start + Math.ceil((end - start) / 2);
                
            return {
                start: start,
                end: end,
                median: median
            };
        },
        
        installed: false,
        
        rendered: false,
        
        init: function(len){
            this.rendered = false;
            this.installed = false;
            this.inDoc = {};
            if(itemAmount <= max ){
                return;
            }
            this.installed = true;
        },
        
        each: function(callback){
            $.each(this.inDoc, callback);
        },
        
        inDoc: {
            /** absIndex: $el **/
        },
        
        remove: function(absIndex){
            if(this.inDoc[absIndex] != null){
                this.inDoc[absIndex].remove();
                delete this.inDoc[absIndex];
            }
        },
        
        setContent: function(absIndex, obj){
            if(this.has(absIndex) && obj){
                var img = this.get(absIndex).removeClass('unloaded')[0].childNodes[0];
                img.src = obj.url_s;
                $(img).one('load', function(){
                	this.removeAttribute('height');
                	this.removeAttribute('width');
                });
            }
        },
        
        get: function(absIndex){
            return this.inDoc[absIndex];
        },
        
        add: function(absIndex){
            var list,
                img;
            if(!options.data[absIndex] || !options.data[absIndex].url_sq){
                img = '<img src="images/gallery/background.png" data-index="'+absIndex+'" height="'+options.imageHeight+'" width="'+options.imageWidth+'" draggable="false" />';
                list = $('<li data-index="'+absIndex+'" class="unloaded"></li>');
            }else{
                img = '<img src="'+options.data[absIndex].url_s+'" data-index="'+absIndex+'" draggable="false" />';
                list = $('<li data-index="'+absIndex+'" class="loaded"></li>');
            }
            list.append(img);
            list.css('left', absIndex * itemWidth + options.thumbnailPadding );
            ul.append(list);
            this.inDoc[absIndex] = list;
        },
        
        has: function(absIndex){
            return Boolean(this.inDoc[absIndex]);
        },
        
        reRender: function(){
            var boundaryInfo = this.getBoundaryInfo(),
                items = $('li', wrapper),
                that = this,
                newList,
                start = Math.floor(Math.max(0, boundaryInfo.median - nodesLength / 2)),
                end = start + nodesLength,
                relativeIndex = 0;
            
            if(!this.installed){
                start = 0;
            }
            
            items.each(function(index, item){
                index = item.dataset.index;
                if(index < start){
                    that.remove(index);
                }else if(index > end){
                    that.remove(index);
                }
            });
            
            while(nodesLength > relativeIndex && start < itemAmount){
                if(this.has(start)){
                    relativeIndex++;
                    start++;
                    continue;
                }
                this.add(start);
                relativeIndex++;
                start++;
            }
            
            // active
            if(this.has(currentIndex) && !this.get(currentIndex).hasClass('active')){
                $('li', ul).removeClass('active');
                this.get(currentIndex).addClass('active');
            }
        },
        
        update: function(){
            if(!this.installed && this.rendered){
                // max unreached, and rendered
                return;
            }
            this.rendered = true;
            this.reRender();
        }
    };
    function move(offset, opt){
        opt = $.extend({
            isDrag: false,
            trigger: true
        }, opt);
        var boundaryInfo = itemHelper.getBoundaryInfo(offset),
            dir = dragOffset < 0 ? 1 : 2;
        if(opt.trigger){
            Dispatcher.trigger('gallery:thumb/move', boundaryInfo.start, boundaryInfo.end, dir);
        }
        
        if(thumbnailWidth < containerWidth){
            ul.css({
                // '-webkit-transform': 'translate3d(0px, 0px, 0px)'
                '-webkit-transform': 'translate(0px, 0px)'
            });
            return;
        }
        ul.css({
            // '-webkit-transform': 'translate3d('+ offset +'px, 0px, 0px)'
            '-webkit-transform': 'translate('+ offset +'px, 0px)'
        });
        
        if(!opt.isDrag){
            currentOffset = offset;
        }
        
    }
    
    function dragHandler(deltaX){
        dragOffset = deltaX;
        var offset = deltaX + prevOffset;
        if(offset > 0){
            offset *= dampingFactor;
        }else if(offset < -(thumbnailWidth - containerWidth)){
            offset += (-(thumbnailWidth - containerWidth) - offset) * (1-dampingFactor);
        }
        
        move(offset, {
            isDrag: true
        });
    }

    function moveTo(index, trigger){
        // if(!~-1) return;
        var deltaX = index  * itemWidth - containerWidth / 2 + itemWidth / 2 + options.thumbnailPadding - 2, // 2 == image relative offset
            moveOpt = {
                trigger: trigger === false ? false : true
            };
        
        currentIndex = index;
        setActive(itemHelper.get(index));
        
        if(deltaX < 0){
            deltaX = 0;
        }else if(deltaX > thumbnailWidth - containerWidth){
            deltaX = -(thumbnailWidth - containerWidth);
        }else {
            deltaX = -deltaX + options.thumbnailPadding / 2;
        }
        
        try{
            scroller.scrollTo(deltaX, 0, 400);
        }catch(e){
            ul[0].style.webkitTransitionDuration = '400ms';
            move(deltaX, moveOpt);
            itemHelper.update();
        }
    }
    
    function setActive(item){
        if($(item).size()){
            $('li', wrapper).removeClass('active');
            $(item).addClass('active');
        }
    }

    function thumbHandler(e){
        if(e.gesture){
            e.gesture.preventDefault();
            if(e.gesture.deltaX < 0 && thumbnailWidth <= containerWidth){
                return;
            }
        }
        switch(e.type) {
            case 'dragstart':
                prevOffset = currentOffset;
                ul[0].style.webkitTransitionDuration = '0ms';
                itemTap = false;
                break;
            case 'drag':
                if(e.gesture){
                    dragHandler(e.gesture.deltaX);
                }
                break;
            case 'mousewheel':
                var newOffset = currentOffset + e.wheelDelta,
                    boundaryRight = -(thumbnailWidth - containerWidth);
                if((currentOffset == 0 && e.wheelDelta > 0) || (currentOffset == boundaryRight && e.wheelDelta < 0)){
                    return;
                }
                if(newOffset > 0){
                    newOffset = 0;
                }else if(newOffset < boundaryRight){
                    newOffset = boundaryRight;
                }
                ul[0].style.webkitTransitionDuration = '0ms';
                move(newOffset);
                itemHelper.update();
                break;
            case 'dragend': 
                // FIXME seems like a hammer bug...fired on a wrong time(dragstart)
                if(itemTap){
                    return;
                }
                ul[0].style.webkitTransitionDuration = '400ms';
                currentOffset += dragOffset;
                prevOffset = 0;
                if(currentOffset > 0){
                    move(0);
                }else if(currentOffset < -(thumbnailWidth - containerWidth)){
                    move(-(thumbnailWidth - containerWidth));
                }
                itemTap = true;
                itemHelper.update();
                break;
            case 'swipe':
                if(e.gesture){
                    var velocity = Math.max(e.gesture.velocityX, 5);
                    dragHandler(e.gesture.deltaX * velocity); // * e.gesture.velocityX * 2);
                }
                break;
            case 'touchstart':
                // e.stopPropagation();
                break;
            case 'touchend':
                if(itemTap && e.target.dataset.index){
                    var item = e.target.nodeName.toLowerCase() == 'li' ? e.target : $(e.target).parents('li')[0],
                        newIndex = +e.target.dataset.index;
                    if(isNaN(newIndex) || !item){
                        return;
                    }
                    setActive(item);
                    Dispatcher.trigger('gallery:thumb/itemTap', e.target.parentNode, newIndex, currentIndex);
                    moveTo(newIndex);
                }
                break;
            case 'release':
            
                break;
        }
    }
    function reset(){
        ul = $('ul', wrapper);
        itemWidth = options.itemWidth;
        thumbnailWidth = itemWidth * itemAmount + options.thumbnailPadding;
        containerWidth = $(body).width();
        img = $('img', ul);
        ul.width(thumbnailWidth);
    }
    
    function render(){
        nodesLength = itemAmount > max ? max : itemAmount;
        $('ul', wrapper).empty();
        itemHelper.init();
    }
    
    function orientationchangeHandler(){
        containerWidth = $(body).width();
        moveTo(currentIndex);
    }
    
    function init(len){
        clearTimeout(dataWaitingTimer);
        itemAmount = len;
        render();
        reset();
        currentIndex = options.initActive;
        itemHelper.update();
        if(options.iScroll){
            scroller = new iScroll(wrapper[0], {
                // bounce: false,
                hScrollbar: false,
                vScrollbar: false,
                onScroll: function(){
                    currentOffset = this.x;
                    itemHelper.update();
                },
                onScrollEnd: function (){
                    // itemHelper.update();
                    var boundaryInfo = itemHelper.getBoundaryInfo(this.x);
                    Dispatcher.trigger('gallery:thumb/move', boundaryInfo.start, boundaryInfo.end);
                }
            });
            
            Hammer(ul[0]).on('touchend', function(e){
                if(e.target.dataset.index){
                    var item = $(e.target).parents('li')[0],
                        newIndex = +e.target.dataset.index;
                    if(isNaN(newIndex) || !item){
                        return;
                    }
                    // setActive(item);
                    Dispatcher.trigger('gallery:thumb/itemTap', e.target.parentNode, newIndex, currentIndex);
                    moveTo(newIndex);
                }            
            });
            

        }else if(!eventInstalled){
            Hammer(ul[0], {
                swipe_velocity: 1
            }).on(events, thumbHandler);
            eventInstalled = true;
            // $(window).on("orientationchange", orientationchangeHandler);
        }
    }
    
    return {
        setOption: function(opt){
            $.extend(options, opt);
        },
        getOption: function(k){
            return options[k];
        },
        move: function(x){
            ul[0].style.webkitTransitionDuration = '400ms';
            move(+x);
        },
        moveTo: moveTo,
        prev: function(){
            moveTo(currentIndex - 1);
        },
        next: function(){
            moveTo(currentIndex + 1);
        },
        getCurrentIndex: function(){
            return currentIndex;
        },
        reset: function(){
            reset();
            moveTo(currentIndex, false);
        },
        setData: function(data, len){
            len = len ? len : itemAmount;
            var result = {length: len};
            options.data = $.extend(options.data, result, data);
            setTimeout(function(){
                itemHelper.each(function(index, item){
                    index = item[0].dataset.index;
                    if(item.hasClass('unloaded') && options.data[index]){
                        itemHelper.setContent(index, options.data[index]);
                    }
                });
            }, 50);
        },
        afterResize: orientationchangeHandler,
        init: init,
        destroy: function(){
            Hammer(ul[0]).off(events, thumbHandler);
        }
    };
};