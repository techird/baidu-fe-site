/**
 * @desc 返回按钮
 */
$.GalleryWidget.before.returnBtn = function(){
	var that = this,
	hammer = null,
	returnBtn = $('<div id="gallery-return"></div>');
	that.el.header.append(returnBtn);

	hammer = Hammer(returnBtn[0]);
	
	that.bindEvent(hammer, 'tap', function(e){
		setTimeout(function(){
	        that.dispatcher.trigger('gallery:return');
		}, 300);
    });
    
    that.bindEvent(hammer, 'touchstart', function(e){
    	e.target.classList.add('active');
    });
    
    that.bindEvent(hammer, 'touchend', function(e){
    	e.target.classList.remove('active');
    });
};
