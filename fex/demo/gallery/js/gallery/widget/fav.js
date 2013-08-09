/**
 * @desc 收藏
 */
$.GalleryWidget.after.fav = function(){
		var that = this,
		tip = null,
		favedCache = [],
		status = '',
		fav = $('<span id="gallery-fav" class="gallery-header-btn">收藏</span>');
		
		that.el.header.append(fav);
		
		var hammer = Hammer(fav[0]);
		
		that.bindEvent(hammer, 'tap', function(e){				
			var index = that.getCurrentIndex();
			if(status == 'loading') return;
			status = 'loading';
			that.dispatcher.trigger('gallery:showTip', '正在收藏...');
			
			that.dataAPI.addFav(_USER['id'], index, function(rsp){
				if (rsp.errno === 0) {
                    that.dispatcher.trigger('gallery:showTip', '\u6536\u85cf\u6210\u529f', 1.5);
                } else {
                    if (rsp.errno === 20026) {
                        that.dispatcher.trigger('gallery:showTip', '\u8bf7\u5148\u767b\u5f55', 1.5);
                    } else {
                        that.dispatcher.trigger('gallery:showTip', '\u8bf7\u5148\u767b\u5f55', 1.5);
                    }
                }

				status = '';
				favedCache.push(index);
			});
	    });
	    
	    that.bindEvent(hammer, 'touchstart', function(e){
	    	e.target.classList.add('active');
	    });
	    
	    that.bindEvent(hammer, 'touchend', function(e){
	    	e.target.classList.remove('active');
	    });
};
