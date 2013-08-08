/**
 * @desc 换图集
 */
$.GalleryWidget.after.next = function(){
	var that = this,
	hammer = null,
	status = '',
	next = $('<span id="gallery-next" class="gallery-header-btn">换图集</span>');
	
	that.el.header.append(next);
	hammer = Hammer(next[0]);
	
	that.bindEvent(hammer, 'tap', function(e){
		if(status == 'loading') return;
		status = 'loading';
		that.dispatcher.trigger('gallery:showTip', '正在获取下一个图集数据...');
		that.dataAPI.getNextCollection(function(rsp){
	        if(rsp.no == 0){
	    		that.dispatcher.trigger('gallery:showTip', '即将进入：【' + rsp.data.title +"】");
	    		setTimeout(function(){
		    		location.href = '/photo/p?kw='+rsp.data.forum_name+'&tid='+rsp.data.tid;
	    		}, 1000);
	    	}else{
	    		if(rsp.no == 350000){
		    		that.dispatcher.trigger('gallery:showTip', '数据获取失败，请稍后重试', 2);
	    		}
	    	}
	    	status = '';
		});
    });
    
    that.bindEvent(hammer, 'touchstart', function(e){
    	e.target.classList.add('active');
    });
    
    that.bindEvent(hammer, 'touchend', function(e){
    	e.target.classList.remove('active');
    });
};