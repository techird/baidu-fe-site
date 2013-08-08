/**
 * @desc 进度条
 */
$.GalleryWidget.after.progress = function() {
	var $progress = $('<div id="gallery-progress" />'),
		total = this.config.total,
		unit = 100 / total;
		
	this.gallery.el.thumbnail.append($progress);

	this.bindEvent(this.dispatcher, 'gallery:afterSwitch', function(index){
		var percentage = unit * (index + 1);
		$progress.css('width', percentage + '%');
	});
};
