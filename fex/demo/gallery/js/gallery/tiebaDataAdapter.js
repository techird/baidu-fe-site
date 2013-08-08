(function(){
    $.GalleryData.adapter = {
        url: {
            getPhotos: '/photo/list',
            getComments: '/photo/comments',
            postComment: '/pad/commit/post/add_post',
			postPhotoComment: '/photo/cm/comment/add',
			postFav: 'http://up.xiangce.baidu.com/opencom/picture/fav/upload?callback=?'
        },
        
        // context: GalleryData
        query: {
            photo: function(id, index){
                return{
                    kw: this.data.kw,
                    tid: this.data.tid,
                    // pid: this.data.pid,
                    pic_id: id,
                    index: index,
                    total: this.data.total,
                    prev: 20,
                    next: 20
                };
            },
            comments: function(page, photoId){
                return{
                    kw: this.data.kw,
                    tid: this.data.tid,
                    pic_id: photoId,
                    // pid: this.data.pid,
                    pn: page,
                    rn: this.config.commentsPerPage
                };
            },
            fav: function(param){
            	return {
            		app_id: 314406,
            		descript: this.data.title,
            		uid: param.uid,
            		source_url: encodeURIComponent(location.href),
            		tags: encodeURIComponent("\u767e\u5ea6\u8d34\u5427," + this.data.kw + "\u5427"),
            		url: param.url
            	};
            }
        }
    };
    
    $.GalleryData.adapter.photo = function(data){
        return {
            id: data.id,
            title: this.data.title,
            desc: data.des,
            pid: data.pid,
            url: data.url,
            url_s: data.surl
        };
    };
    
    $.GalleryData.adapter.comment = function(list){
        var target = [];
        if(list && list.length){
            list.forEach(function(comment){
                var parts = comment.time.match(/(\d+)/g);
                var t = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4]).getTime();
                t = t / 1000;
                target.push({
                    commentId: comment.id || Math.random() * 10E15,
                    avatar: 'http://tb.himg.baidu.com/sys/portraitn/item/' + comment.portrait,
                    name: comment.name,
                    content: comment.content,
                    time: t // new Date(comment.time).getTime() / 1000
                });
            });
        }
        return {
            commentList: target
        };
    };
    
    $.GalleryData.adapter.comments = function(data){
        data = data.data;
        return $.extend($.GalleryData.adapter.comment(data.comments), {
            page: data.pn,
            perPage: data.rn,
            total: data.total
        });
        
    };
})();
