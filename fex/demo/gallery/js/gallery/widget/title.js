/**
 * @desc 标题
 */

$.GalleryWidget.before.title = function(){
	var that = this,
		titleCache = '',
		title = $('<span id="gallery-title">Loading...</span>');
	this.el.header.append(title);

	this.bindEvent(this.dispatcher, 'gallery:afterSwitch/photo', function(photo, index){
		if(photo.title != titleCache){
			title.html(photo.title);
			titleCache = photo.title;
		}
	});
};
