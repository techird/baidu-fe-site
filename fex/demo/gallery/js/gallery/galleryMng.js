void function(exports){
	var GalleryMng = function(dispatcher, config, data){
	    this.dispatcher = dispatcher;
	    this.el = {};
	    this.timer = {};
	    this.eventsList = [];
	    this.AOP = {
	    	before: [],
	    	after: []
	    };
	    this.isReady = false;
	    this.config = {
	    	container: 'gallery-container',
	    	// animEndName: 'webkitAnimationEnd'
	    	animEndName: 'webkitTransitionEnd'
	    };
	    this.cacheAOP();
	    /*
	    var definedAnimations = ['bounce', 'fadeDown', 'fadeUp', 'scale', 'lightSpeed', 'leftFall'],
	    	animType = definedAnimations[Math.floor(Math.random() * definedAnimations.length)];
	    this.animationClass = {};
	    this.animationClass.show = 'anim-'+animType+'Show';
	    this.animationClass.hide = 'anim-'+animType+'Hide';
	    */
	   	this.animationClass = {};
	   	this.animationClass.show = 'show';
	   	this.animationClass.hide = '';
	    
	    this.beforeInit();
	    if(data.total){
	    	this.ready(config, data);
	    }else{
	    	this.setBeforeReadyLoading();
	    }
	};
	
	(function(GalleryMng){
	    var that = null,
	    commentHelper = {
	        
	        text: {
	            up: {
	                pull: '上拉加载下一页评论...',
	                release: '释放加载下一页评论...'
	            },
	            down: {
	                pull: '下拉加载上一页评论...',
	                release: '释放加载上一页评论...'
	            },
	            loading: '加载中，请稍等...'
	        },
	        
	        page: 0,
	        
	        perPage: 0,
	        
	        total: 0,
	        
	        pages: 0,
	        
	        currentIndex: -1,
	        
	        hasContent: false,
	        
	        getDays: function(secondTimestamp){
	        	if(isNaN(secondTimestamp)) return secondTimestamp;
	            var timestamp = new Date(secondTimestamp * 1000),
	                secondsDistance = (new Date().getTime() - timestamp.getTime()) / 1000,
	                min = 60,
	                hour = min * 60,
	                day = hour * 24,
	                mon = day * 30,
	                year = day * 365;
	        
	            if (secondsDistance < min) {
	                 return '刚刚';
	            }else if (secondsDistance < hour) {
	                 return Math.round(secondsDistance/min) + '分钟前';   
	            }else if (secondsDistance < day ) {
	                 return Math.round(secondsDistance/hour ) + '小时前';   
	            }else if (secondsDistance < mon) {
	                return Math.round(secondsDistance/day) + '天前';   
	            }else if (secondsDistance < year) {
	                return Math.round(secondsDistance/mon) + '月前';   
	            }else {
	                return Math.round(secondsDistance/year ) + '年前';
	            }
	        },
	        
	        updatePages: function(){
	        	this.pages = Math.ceil(this.total / 10);
	        },
	        
	        write: function(index, page, jumpToBottom){
	        	var me = this,
	        		commentForm = $(that.getTmpl('commentForm')),
	        		total = this.cache[index]['total'],
	        		commentList = this.cache[index]['list'];
	        		
	            that.el.commentList.empty()
	                .siblings().remove();
	                
	            if(total != 0){
	                commentList.forEach(function(item){
	                    that.el.commentList.append(that.getTmpl('comment', $.extend(item, {
	                        time: me.getDays(item.time)
	                    })));
	                });
	            }else{
	                that.el.commentList.append(that.getTmpl('emptyComment'));
	            }
	            
	            that.el.commentList.append(commentForm);
	            that.el.commentForm = commentForm.children('form')[0];
	            that.el.commentInput = $(that.el.commentForm).children('input')[0];
	            
	            if(me.hasPrevPage()){
	                $(that.getTmpl('pullDown', {
	                    text: me.text.down.pull
	                })).insertBefore(that.el.commentList);
	            }
	            me.fixIScroll();
	            
	            if(me.hasNextPage()){
	                $(that.getTmpl('pullUp', {
	                    text: me.text.up.pull
	                })).insertAfter(that.el.commentList);
	            }
	            
	            that.iScroll.refresh();
	            setTimeout(function(){
	                if(jumpToBottom){
	                	that.iScroll.scrollTo(0, that.iScroll.maxScrollY + 50, 0);
	                }else{
	                	
			            that.iScroll.scrollTo(0, 0, 0);
	                }
	        	}, 5);
	        	
	        	this.hasContent = true;
	        },
	        
	        cache: {
	        	/*
	        	 * index: {
	        	 * 		total: total,
	        	 * 		list: commentList
	        	 * }
	        	 */
	        },
	        
	        load: function(index, page, jumpToBottom){
	            var me = this;
	            if(that.dataAPI){
		            that.dataAPI.getComment(index, page, function(data){
		                if(index != that.gallery.getCurrentIndex()){
		                    return;
		                }
		                me.total = data.total;
		                me.updatePages();
		                me.page = data.page;
		                me.perPage = data.perPage;
		                me.currentIndex = index;
		                me.cache[index] = {
		                	total: data.total,
		                	list: data.commentList
		                };
		                that.el.commentCount.html(data.total).removeClass('loading');
		                
		                if(!me.isHide()){
		                	me.write(index, page, jumpToBottom);
		                }
		            });
	            }
	        },
	        
	        // bofore request
	        beforeRqt: function(){
	            that.el.commentList.empty()
	                .siblings().remove();
	            that.el.commentList.html('<li>'+this.text.loading+'</li>').
	            	css('height', 'auto');
	            that.iScroll.options.topOffset = 0;
	            that.iScroll.refresh();
	        },
	                
	        // FIXME hack for iScroll height calculate
	        fixIScroll: function(){
	            that.el.commentList.css('height', 'auto');
	            if(this.hasPrevPage()){
	                that.iScroll.options.topOffset = 50;
	                that.iScroll.refresh();
	                if(!that.iScroll.vScrollbar){
	                    that.el.commentList.css('height', that.el.commentList.height() - 50);
	                    that.iScroll.refresh();
	                }
	            }else{
	                that.iScroll.options.topOffset = 0;
	            }
	        },
	        
	        loadPrevPage: function(){
	            if(this.hasPrevPage()){
	                this.load(this.currentIndex, +this.page - 1);
	            }
	        },
	        
	        loadNextPage: function(){
	            if(this.hasNextPage()){
	                this.load(this.currentIndex, +this.page + 1);
	            }
	        },
	        
	        hasNextPage: function(){
	            return this.page < this.pages;
	        },
	        
	        hasPrevPage: function(){
	            return this.page != 1;
	        },
	        
	        clear: function(){
	        	// return;
	            this.page = 0;
	            this.perPage = 0;
	            this.pages = 0;
	            this.hasContent = false;
	            that.el.commentCount.html('...')
	            	.addClass('loading');
	        },
	        
	        show: function(){
	        	var me = this;
	            that.el.commentsWrapper.addClass('show');
		        if(!this.hasContent){
	            	this.beforeRqt();
		            setTimeout(function(){
		            	me.write(that.gallery.getCurrentIndex());
		            }, 800);
	            }
	        },
	        
	        hide: function(){
	            that.el.commentsWrapper.removeClass('show');
	        },
	        
	        isHide: function(){
	            return !that.el.commentsWrapper.hasClass('show');
	        }
	    };
	
	    $.extend(GalleryMng.prototype, {
	    	cacheAOP: function(){
	    		if($.GalleryWidget){
					for(var i in $.GalleryWidget){
						for(var j in $.GalleryWidget[i]){
							this.AOP[i].push($.GalleryWidget[i][j]);
						}
					}
			    }
	    	},
	    	
	        getTmpl: function(name, data){
	            return {
	                header: _.template('<header id="gallery-header">'+
	                        // '<span id="gallery-title">Loading...</span>'+
	                    '</header>'),
	                beforeReadyLoading: _.template('<span class="loading"></span>'),
	                info: _.template('<div id="gallery-info">'+
	                    '<div id="gallery-info-index"><span id="gallery-index">...</span> / <span id="gallery-length"></span></div>'+
	                    '<div id="gallery-info-desc"></div>'+
	                    '<div id="gallery-info-comment-btn">评论（<span id="gallery-info-comment-count">...</span>）</div>'+
	                    '<div id="gallery-comments-wrapper"><div id="gallery-comments-scroll"><div>'+
	                    '<ul id="gallery-comments"></ul>'+
	                    '</div></div></div>'+
	                '</div>'),
	                emptyComment: _.template('<li>该图片还没有评论噢~</li>'),
	                comment: _.template('<li>'+
	                        '<img src="<%=avatar%>" />'+
	                        '<div><h6><%=name%></h6>'+
	                        '<p class="comment-content"><%=content%></p>'+
	                        '<p><%=time%></p></div>'+
	                        '<a class="reply" data-user="<%=name%>">回复</a>'+
	                '</li>'),
	                commentForm: _.template('<li><form><input type="text" placeholder="我也说一句" /></form></li>'),
	                pullDown: _.template('<div id="gallery-comments-pullDown"><span class="pullDownIcon"></span><span class="pullDownLabel"><%=text%></span></div>'),
	                pullUp: _.template('<div id="gallery-comments-pullUp"><span class="pullUpIcon"></span><span class="pullUpLabel"><%=text%></span></div>')
	            }[name](data);
	        },
	        
	        beforeInit: function(){
	        	that = this;
	        	this.el.container = $('#'+this.config.container);
	            if(!this.el.container.size()){
	                this.el.container = $('<div id="'+ this.config.container +'" class="'+this.animationClass.hide+'" />');
	                $(document.body).append(this.el.container);
	            }
				this.el.container.prepend(this.getTmpl('header'));
				this.el.header = $('#gallery-header');
				
	            this.bindEvent(Hammer(this.el.container[0]), 'touchmove', function(e){
	                e.preventDefault();
	            });
	            
	            this.execAOP('before');
	        },
	        
	        execAOP: function(t){
	        	var that = this;
	        	this.AOP[t].forEach(function(aop){
	        		aop.call(that);
	        	});
	        },
	        
	        setBeforeReadyLoading: function(){
	        	this.el.beforeReadyLoading = $(this.getTmpl('beforeReadyLoading'));
	        	this.el.container.append(this.el.beforeReadyLoading);
	        },
	        
	        init: function(){
	            // that = this;
	            
	            this.gallery = new $.GalleryCore(this.dispatcher, this.dataAPI, {
	                total: this.config.total,
	                el: this.el.container
	            });
	            this.el.container.append(this.getTmpl('info'));
	            this.el.footer = $('#gallery-info');
	            // this.el.title = $('#gallery-title');
	            this.el.index = $('#gallery-index');
	            this.el.length = $('#gallery-length').html(this.config.total);
	            this.el.desc = $('#gallery-info-desc');
	            this.el.commentBtn = $('#gallery-info-comment-btn');
	            this.el.commentCount = $('#gallery-info-comment-count');
	            this.el.commentsWrapper = $('#gallery-comments-wrapper');
	            this.el.commentsScroll = $('#gallery-comments-scroll');
	            this.el.commentList = $('#gallery-comments');
	            this.el.commentPullDown = $('#gallery-comments-pullDown');
	            this.el.commentPullUp = $('#gallery-comments-pullUp');
	            
	            this.execAOP('after');
	        },
	        
	        bindEvent: function(obj, name, handler){
	            this.eventsList.push({
	                obj: obj,
	                name: name,
	                handler: handler
	            });
	            obj.on(name, handler);
	        },
	        
	        dispatchEvent: function(){
	            var that = this,
	                pullDownOffset = 50,
	                pullUpOffset = 50,
	                loadCommentTimer = null,
	                commentsWrapper = this.el.commentsWrapper[0];
	            
	            this.bindEvent(this.dispatcher, 'gallery:postComment/success', function(){
					commentHelper.total++;
					commentHelper.updatePages();
					// get latest comment
					commentHelper.load(that.gallery.getCurrentIndex(), commentHelper.pages, true);
	            });
	            
	            this.bindEvent(this.dispatcher, 'gallery:scaleable/scaleback', function(factor){
	        		that.dispatcher.trigger('gallery:return');
	            });
	            
	            this.bindEvent(this.dispatcher, 'gallery:afterSwitch', function(index){
	            	that.dataAPI.setCurrentIndex(index);
	                
	                that.dataAPI.getPhoto(index, function(data){
		                that.el.index.html(index + 1);
		                that.el.desc.html(data.desc);
		                that.dispatcher.trigger('gallery:afterSwitch/photo', data, index);
		            });
	                
	                clearTimeout(loadCommentTimer);
	                loadCommentTimer = setTimeout(function(){
		                commentHelper.load(index, 1);
	                }, 500);
	            });
	            
	            this.bindEvent(this.dispatcher, 'gallery:beforeSwitch', function(index){
	                commentHelper.hide();
	                commentHelper.clear();
	            });
	            
	            this.bindEvent(this.dispatcher, 'gallery:hideThumbnail', function(){
	                that.hideThumbnail();
	            });
	            
	            this.bindEvent(this.dispatcher, 'gallery:showThumbnail', function(){
	                that.showThumbnail();
	            });
	            
	            this.bindEvent(Hammer(this.el.container[0]), 'touchstart', function(e){
	                if(e.target == that.el.commentBtn[0] || e.target.parentNode == that.el.commentBtn[0]){
	                    commentHelper.isHide() ? commentHelper.show() : commentHelper.hide();
	                } else if(!$(e.target).parents('#gallery-comments-wrapper').size()){
	                    if(!commentHelper.isHide()){
	                        commentHelper.hide();
	                    }
	                }
	            });
	            
	            this.bindEvent(Hammer(commentsWrapper), 'dragstart', function(e){
	                e.gesture && e.gesture.preventDefault();
	            });
	
	            this.bindEvent(Hammer(commentsWrapper), 'tap', function(e){
	            	if(e.gesture.target.className != 'reply') return;
	            	e.gesture.preventDefault();
	                var replyBtn = e.gesture.target,
	                	userName = replyBtn.dataset.user;
	                	
	                that.iScroll.scrollTo(0, that.iScroll.maxScrollY + 50, 0);
	                
	                that.el.commentInput.value = '回复 @' + userName + ' : ';
	                setTimeout(function(){
		                that.el.commentInput.focus();
	                }, 1);
	            });
	
	            this.bindEvent($(commentsWrapper), 'submit', function(e){
	                e.preventDefault();
	                var input = e.target.childNodes[0],
	                	value = input.value;
	                that.dataAPI.postComment({
	                	content: value
	                });
	                input.blur();
	            });
	            
	            this.bindEvent(Hammer(this.el.desc[0]), 'tap', function(e){
	            	var style = e.target.style;
	            	if(style.height != 'auto'){
	            		style.height = 'auto';
	            	}else{
						style.height = '40px';
	            	}
	            });
	            
	            
	            // this.el.commentPullDown
	            this.iScroll = new iScroll(this.el.commentsScroll[0], {
	                checkDOMChanges: false,
	                useTransition: true,
	                topOffset: pullUpOffset,
	                onBeforeScrollStart: function(){
	                	
	                },
	                onScrollMove: function () {
	                    var pullDownEl = document.getElementById('gallery-comments-pullDown'),
	                        pullUpEl = document.getElementById('gallery-comments-pullUp');
	                    if (pullDownEl && this.y > 5 && !pullDownEl.className.match('flip')) {
	                        pullDownEl.className = 'flip';
	                        pullDownEl.querySelector('.pullDownLabel').innerHTML = commentHelper.text.down.release;
	                        this.minScrollY = 0;
	                    } else if (pullDownEl && this.y < 5 && pullDownEl.className.match('flip')) {
	                        pullDownEl.className = '';
	                        pullDownEl.querySelector('.pullDownLabel').innerHTML = commentHelper.text.down.pull;
	                        this.minScrollY = -pullDownOffset;
	                    } 
	                    
	                    else if (pullUpEl && this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
	                        pullUpEl.className = 'flip';
	                        pullUpEl.querySelector('.pullUpLabel').innerHTML = commentHelper.text.up.release;
	                        // this.maxScrollY = this.maxScrollY;
	                    } else if (pullUpEl && this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
	                        pullUpEl.className = '';
	                        pullUpEl.querySelector('.pullUpLabel').innerHTML = commentHelper.text.up.pull;
	                        // this.maxScrollY = pullUpOffset;
	                    }
	                },
	                onScrollEnd: function () {
	                    var pullDownEl = document.getElementById('gallery-comments-pullDown'),
	                        pullUpEl = document.getElementById('gallery-comments-pullUp');
	                    if (pullDownEl && pullDownEl.className.match('flip')) {
	                        pullDownEl.className = 'loading';
	                        pullDownEl.querySelector('.pullDownLabel').innerHTML = commentHelper.text.loading;                
	                        commentHelper.loadPrevPage();
	                    } else if (pullUpEl && pullUpEl.className.match('flip')) {
	                        pullUpEl.className = 'loading';
	                        pullUpEl.querySelector('.pullUpLabel').innerHTML = commentHelper.text.loading;                
	                        commentHelper.loadNextPage();
	                    }
	                }
	            });
	            
	            // set loading status for comment
	            commentHelper.beforeRqt();
	        },
	        
	        hideThumbnail: function(){
	            this.el.header.addClass('hide');
	            this.el.footer.addClass('hide');
	            commentHelper.hide();
	        },
	        
	        showThumbnail: function(){
	            this.el.header.removeClass('hide');
	            this.el.footer.removeClass('hide');
	        },
	        
	        switchToIndex: function(index){
	        	if(!this.isReady) return;
	            this.gallery.switchTo(index);
	            return this;
	        },
	        
	        switchToId: function(id){
	        	if(!this.isReady) return;
	            var that = this,
	                index = this.dataAPI.getIndex(id);
	            if(index !== null){
	                this.switchToIndex(index);
	            }else{
	                this.dataAPI.asyncGetIndex(id, function(index){
	                    that.switchToIndex(index);
	                });
	            }
	        },
	        
	        getId: function(index){
	            return this.dataAPI.getId(index).id;
	        },
	        
	        show: function(){
	            this.el.container.removeClass(this.animationClass.hide);
	            this.el.container.addClass(this.animationClass.show);
	            return this;
	        },
	        
	        ready: function(config, data){
				$.extend(this.config, {
			        total: data.total
			    }, config);
			    
			    this.dataAPI = new $.GalleryData({}, data, this);
			    this.init();
			    this.dispatchEvent();
			    if(this.el.beforeReadyLoading){
			    	this.el.beforeReadyLoading.remove();
			    }
			    this.isReady = true;
	        },
	        
	        getNode: function(){
	        	return this.el.container;
	        },
	        
	        getCurrentIndex: function(){
	        	return this.gallery.getCurrentIndex();
	        },
	        
	        hide: function(cb){
	            var that = this;
	            this.el.container.removeClass(this.animationClass.show);
	            this.el.container.addClass(this.animationClass.hide);
	            this.el.container.one(this.config.animEndName, function(e){
	                cb && cb.call(that);
	            });
	            this.dispatcher.trigger('gallery:hide');
	            return this;
	        },
	        
	        destroy: function(){
	            if(this.destroyed){
	                return;
	            }
	            this.eventsList.forEach(function(e){
	                e.obj.off(e.name, e.handler);
	            });
	            try{
		            this.iScroll.destroy();
		            this.gallery.destroy();
		            this.dataAPI.destroy();
	            }catch(e){
	            	
	            }finally{
	            	this.el.container.empty();
		            this.el.container.remove();
	            	this.dataAPI = null;
		            this.destroyed = true;
		            this.dispatcher.trigger('gallery:destroy');
	            }
	        }
	    });
	})(GalleryMng);
	
	exports.GalleryMng = GalleryMng;
	
}( Zepto );
