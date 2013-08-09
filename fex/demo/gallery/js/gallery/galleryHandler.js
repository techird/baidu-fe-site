(function(){
    // hack
    var dispatcher = $.extend({}, app.Dispatcher),
        status = '',
        currentData = null,
        currentId = -1,
        openInNewTab = false,
        tip = null,
        instantiationParamCache = {
            // id: paramObj
        },
        origin = {
            url: null,
            page: null
        },
        gallery = null;
        
    dispatcher.on = dispatcher.addEventListener;
    dispatcher.trigger = dispatcher.postMessage;
    dispatcher.off = dispatcher.removeEventListener;
    
    dispatcher.on('gallery:showTip', function(content, seconds){
    	var timer = null;
    	clearTimeout(timer);
    	if(tip){
			tip.show();
			tip.setContent(content);
			if(seconds){
				timer = setTimeout(function(){
					tip.hide();
				}, seconds * 1000);
			}
		}
	});
	
	dispatcher.on('gallery:hideTip', function(){
		if(tip)
			tip.hide();
	});
    
    /*
    app.Page.on('beforepagechange', function (pageName, data) {
        if (pageName === 'photo') {
            var id = location.href.match(/pic_id=(.*)&?.*$/)[1];
            currentId = id;
            if(!gallery){
                initGallery(id, currentData, function(){
                    gallery.switchToId(id);
                });
            }else{
                gallery.switchToId(id);
            }
        }else{
            if(gallery){
                gallery.hide(function(){
                    gallery.destroy();
                });
            }
        }
    });
    */

    dispatcher.on('gallery:return', function(){
        if(origin.page == 'photo'){
            location.href = origin.url;
            dispatcher.trigger('gallery:showTip', '正在返回贴子页，请稍等...');
        }else{
        	if(status == 'loading' && gallery){
        		// galleryCore 未初始化
                gallery.hide(function(){
                    gallery.destroy();
                });
                status = '';
        	}else{
	            app.Page.jump(origin.url, {
	                preventDefault: true
	            }, true);
        	}
        }
    });
    
    dispatcher.on('gallery:destroy', function(index){
        try{
	        tip.dispose();
        }catch(e){
        	
        }finally{
	        gallery = null;
        	tip = null;
        }
    });
    
    /*
    dispatcher.on('gallery:afterSwitch', function(index){
    	$.get('/pad/common/pv?type=img_browser');
        var id = gallery.getId(index),
        	jumpUrl = '/photo/p?kw='+currentData.forumName+'&tid='+currentData.tid+'&pic_id='+id;
        if(id == currentId){
            return;
        }
        currentId = id;
        app.Path.jump(jumpUrl, {
            preventDefault: true
        }, true);
    });
	*/
    
    dispatcher.on('gallery:postComment/success', function(){
    	dispatcher.trigger('gallery:showTip', '发贴成功', 2);
    });
    
    
    
    
    
    var initGallery = function(id, data, cb){
    	if(gallery != null) return;
        gallery = new $.GalleryMng(dispatcher, {}, data);
        
        /*
        if(data.target){
	        var offset = $(data.target).offset(),
	        	galleryNode = gallery.getNode(),
	        	x = offset.left + offset.width / 2,
	        	y = offset.top + offset.height / 2;
			galleryNode.css('-webkit-transform-origin', x + 'px '+y+'px');
        }
        */
       
        gallery.show();
        cb && cb(id, data);
    },
    
    showPhoto = function(param){
    	/*
    	if(param.from == 'photo' || param.from == 'albumlist'){
            initGallery(picId, param);
            currentData = param;
    		currentId = picId;
            if(param.from == 'albumlist'){
	            app.Page.jump(jumpUrl, {
	                preventDefault: true,
	                id: picId
	            }, true);
            }else{
            	gallery.getNode().css('background-image', 'url(/tb/static-xphoto/img/background.png)');
            	gallery.switchToId(picId);
            }
    		
            origin.url = param.returnUrl;
            origin.page = param.from;
        }
        */
       	if(gallery != null) return;
       	gallery = new $.GalleryMng(dispatcher, {}, param);
       	gallery.show();
       	gallery.switchToIndex(Math.floor(Math.random()*param.total));
		// initGallery(picId, param);
        // currentData = param;
		// currentId = picId;
    };
    
    /**
     * @desc 提供外部调用接口 
     */
    dispatcher.on( "showPhoto", function(param){
    	// var picId,
    		// jumpUrl;
    	// if(param.src){
    		// param.src = decodeURIComponent(param.src);
            // picId = param.src.substr(param.src.lastIndexOf('/')+1).match(/(.*)\.\w+$/)[1];
    	// }else{
    		// picId = param.picId;
    	// }
		
    	// jumpUrl = '/photo/p?kw='+param.forumName+'&tid='+param.tid+'&pic_id='+picId;
    	// showPhoto(picId, param, jumpUrl);
    	showPhoto(param);
    } );
}());