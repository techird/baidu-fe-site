var AlbumList = function(){
    var el = {},
    
    cachedData = {},
    
    status = '',
    
    eventList = [],
    
    pageInfo = {
    	page: 1,
    	perPage: 20,
    	pages: null
    },
    
    scrollAreaHeight = 0,
    
    conf = {
    	/**
    	 * @desc 优化配置项
    	 */
        optimize: {
            destroyOnScroll: {
                enable: false,
                // strategy: 'destroyChildren',
                strategy: 'destroyAll',
                destroyOffsetFactor: 3
            },
            lazyShow: {
            	enable: true
            },
            imgLazyLoad: {
                enable: false
            }
        },
        /**
         * @desc 列宽
         */
        columnWidth: 220,
        imgWidth: 220,
        refreshOffset: 300,
        dilatateIdAmount: 300
    },
    
    components = {
        iscroll: null,
        layout: null
    },
    
    tmpl = function(data){
        return '<div class="pin" data-len="'+data.count+'" data-primary="'+data.primary+'" data-set-id="'+data.id+'">'+
        '<div class="pin-content">'+
            '<div class="pin-img" style="width:'+data.width+'px; height:'+data.height+'px">'+
                '<img data-src="'+data.src+'"  onload="$(this).addClass(\'show\')" style="width:'+data.width+'px; height:'+data.height+'px" />'+
                '<span>'+data.count+' 张</span>'+
            '</div>'+
            '<div class="pin-desc">'+
                '<h4 class="pin-title">'+data.title+'</h4>'+
                '<p class="pin-info">'+
                    '<span class="pin-user">'+data.userName+'</span>'+
                    '<span class="pin-counter">'+data.countComments+'</span>'+
                '</p>'+
            '</div></div></div>';
    },
   
	batchAppend = function(nodeList, container){
        var fn = arguments.callee,
            dom;
        if(dom = nodeList.shift()){
            if(container.shift){
                // List
                if(components.layout.isElementInIscrollArea(dom)){
                    setTimeout(function(){
                        $(dom).addClass('show');
                    }, 400);
                    container.shift().append(dom);
                }
            }else{
                setTimeout(function(){
                    if(components.layout.isElementInIscrollArea(dom) && !dom.clientHeight){
                        container.append(dom);
                        setTimeout(function(){
                            $(dom).addClass('show');
                        }, 20);
                    }
                }, 20);
            }
            setTimeout(function(){
                fn(nodeList, container);
            }, 20);
        }
    },
   	
    appendToLayout = function(item, delayFactor, get){
        var height = conf.imgWidth * (item.o_height / item.o_width),
        $item = $(tmpl({
            src: 'http://farm'+item.farm+'.staticflickr.com/'+item.server+'/'+item.primary+'_'+item.secret+'_n.jpg',
            width: conf.imgWidth,
            height: height,
            count: item.photos,
            countComments: item.count_views,
            title: item['title']['_content'],
            id: item.id,
            primary: item.primary,
            userName: userName
        }));
        
        if(get){
            return $item;
        }else{
            // setTimeout(function(){
	            components.layout.append($item);
            	$item.addClass('show');
            	var img = $item[0].querySelector('img');
				img.src = img.dataset.src;
            // }, delayFactor * 200);
        }
    },
    
    /**
     * @desc 获取下一页数据
     */
    nextPage = (function(){
        var page = 1,
            pages,
            status = '';
        return function(){
            if(status == 'loading' || (pages && page >= pages)) return false;
            status = 'loading';
            el.statusTip.addClass('loading');
            $.ajax({
                url: '',
                data: {
                    'type': 'ajax',
                    'method': 'getListData',
                    'args[user_id]': userId,
                    'args[page]': ++page
                },
                type: 'get',
                dataType: 'json',
                success: function(data){
                    pages = data.pages;
                    var newNodeList = [];
                    data['sets'].forEach(function(item){
                        appendToLayout(item);
                    });
                    status = '';
                    el.statusTip.removeClass('loading');
                }
            });
            return true;
        }
    })(),
    
    
    /**
     * @desc 优化配置实现
     */
    
    optimization = {
        // context: iscroll
        destroyOnScroll: (function(){
            var time = 0,
            strategy = {
                destroyAll: function(elsInView){
                    var appendNodeList = [];
                    components.layout.each(function(index, item){
                        if(elsInView.indexOf(this) != -1){
                            // in view
                            if(!this.clientHeight){
                                appendNodeList.push(this);
                            }
                        }else{
                            if(el.content[0].contains(this)){
                                $(this).removeClass('show').remove();
                            }
                        }
                    });
                    batchAppend(appendNodeList, el.content);
                },
                
                destroyChildren: function(elsInView){
                    var appendNodeList = [],
                        containerNodeList = [];
                    
                    components.layout.each(function(index, item){
                        if(elsInView.indexOf(this) != -1){
                            if('removedChild' in this.dataset){
                                appendNodeList.push(this.dataset.removedChild);
                                containerNodeList.push($(this));
                                delete this.dataset.removedChild;
                            }
                        }else{
                            if(!('removedChild' in this.dataset)){
                                this.dataset.removedChild = this.innerHTML;
                                $(this).empty();
                            }
                        }
                    });
                    
                    batchAppend(appendNodeList, containerNodeList);
                }
            }[conf.optimize.destroyOnScroll.strategy];
            
            return function(event){
                var newTime = new Date().getTime(),
                    delay = event == 'onScroll' ? 200 : 1000;
                if(newTime - time < delay) return;
                time = newTime;
                var centerY = -this.y + scrollAreaHeight / 2,
                    offset = scrollAreaHeight * conf.optimize.destroyOnScroll.destroyOffsetFactor,
                    elsInView = components.layout.getElementsByYCoor(centerY, offset);
                strategy.call(this, elsInView);
            };
        })(),
        
        lazyShow: (function(){
        	var time = 0;
        	return function(event){
	        	var newTime = new Date().getTime(),
	                delay = event == 'onScroll' ? 200 : 100;
	            if(newTime - time < delay) return;
	            time = newTime;
	            var centerY = components.iscroll.scrollTop() + scrollAreaHeight / 2,
	                offset = scrollAreaHeight * conf.optimize.destroyOnScroll.destroyOffsetFactor,
	                elsInView = components.layout.getElementsByYCoor(centerY, offset);
	            
				components.layout.each(function(index, item){
	                if(elsInView.indexOf(this) != -1){
	                    // in view
	                    if(!this.clientHeight){
	                        $(this).show().addClass('show');
	                    }
	                }
	            });
			};
        }())
    },
    
    installComponent = function(){
        components.layout = new $.WaterfallLayout({
            container: el.content,
            columnWidth : conf.columnWidth
        });
        
        $.extend($.WaterfallLayout.prototype, {
            isElementInIscrollArea: function(el){
                var offsetTop = this.getOffsetTop(el),
                    height = parseInt($(el).css('height'), 10) + 10,
                    scrollY = components.iscroll.y;
                return  (offsetTop + height) > scrollY && offsetTop < (scrollY + scrollAreaHeight);
            }
        });

        // components.iscroll = el.main;
        components.iscroll = el.scroller;
        var scrollContent = el.scrollContent;
        
        _bindEvent(el.scroller, 'scroll', function(){
        	var scrollTop = components.iscroll.scrollTop();
        	if(scrollContent.height() - (scrollTop + scrollAreaHeight) < conf.refreshOffset){
                nextPage();
            }
            
            // optimize
            for(var i in conf.optimize){
                if(conf.optimize.hasOwnProperty(i) && conf.optimize[i].enable){
                    optimization[i].call(this, 'onScrollEnd');
                }
            }
        });
        
        scrollAreaHeight = components.iscroll.height();
    },
    
    _bindEvent = function(obj, event, fn){
    	obj.on(event, fn);
    	eventList.push({
    		obj: obj,
    		event: event,
    		fn: fn
    	});
    },
    
    bindEvent = function(){
    	_bindEvent($(window), 'beforeorientationchange', function(){
    		if(app.Page.state.pageName != 'albumlist') return;
            components.layout.each(function(){
                $(this).hide().removeClass('show');
            });
       	});

		_bindEvent(Hammer(el.main[0]), 'tap', function(e){
        	var target = $(e.gesture.target).parents('.pin')[0];
        	if(target){
        		/*
        		app.Dispatcher.postMessage( "showPhoto", {
				    from: "albumlist",
				    total: target.dataset.len,
				    tid: target.dataset.tid,
				    forumName: cachedData.kw,
				    picId: target.dataset.picid,
				    returnUrl: app.Page.currentURL,
				    target: target
	            } );
	            */
        	}
        });
		
        _bindEvent($(window), 'resize', function(){
            scrollAreaHeight = components.iscroll.height();
            var elLists = components.layout.getElementsByYCoor(components.iscroll.scrollTop(), scrollAreaHeight/2),
                referenceEl = elLists[Math.floor(elLists.length / 2)],
                referenceElPos;
            components.layout.reset();
            referenceElPos = components.layout.getOffsetTop(referenceEl);
            components.iscroll[0].scrollTop = referenceElPos;
            components.layout.getElementsByYCoor(components.iscroll.scrollTop(), 1000).forEach(function(item, index){
				$(item).show().addClass('show');
            });
        });
        
    },
    
    destroy = function(){
    	try{
    		eventList.forEach(function(item){
    			item.obj.off(item.event, item.fn);
    		});
    		eventList = [];
    		components.layout.destroy();
    	}catch(e){}
    	
    	cachedData = {};
		status = '';
    },
    
    setEl = function(param){
    	el.statusTip = $('.album-statusTip').eq(0);
        el.content = $('.album-content').eq(0);
        el.main = $('#album-list-container');
        
        el.scroller = $(param.scroller);
        el.scrollContent = $(param.scrollContent);
    },
    
    init = function(param){
    	destroy();
    	setEl(param);
    	$.extend(cachedData, param);
        installComponent();
        bindEvent();
        
        if(cachedData['albumListData']){
	        cachedData['albumListData'].forEach(function(item, index){
	            appendToLayout(item, index);
	        });
        }
    };
    
    return {
        init: init,
        update: init,
        clear: destroy,
        getComponents: function(){
            return components;
        },
        appendToLayout: appendToLayout
    };
}