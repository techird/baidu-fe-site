(function(){
    $.GalleryData.adapter = {
        url: {
            getPhotos: '',
            getComments: ''
        },
        
        // context: GalleryData
        query: {
            photo: function(page){
                return {
                    'type': 'ajax',
                    'method': 'getPhotosInList',
                    'args[set_id]': this.data.setId,
                    'args[page]': page,
                    'args[per_page]': this.config.photosPerPage
                };
            },
            comments: function(page, photoId){
                return {
                    'type': 'ajax',
                    'method': 'getComments',
                    'args[photo_id]': photoId,
                    'args[page]': page,
                    'args[per_page]': this.config.commentsPerPage
                };
            }
        }
    };
    
    $.GalleryData.adapter.photo = function(data){
        return {
            id: data.id,
            title: data.title,
            desc: data.title,
            url: 'http://farm' + data.farm + '.staticflickr.com/' + data.server + '/' + data.id + '_' + data.secret + '_b.jpg',
            url_s: 'http://farm' + data.farm + '.staticflickr.com/' + data.server + '/' + data.id + '_' + data.secret + '_q.jpg'
        };
    };
    
    $.GalleryData.adapter.comment = function(list){
        var target = [];
        if(list && list.length){
            list.forEach(function(comment){
                target.push({
                    commentId: comment.id,
                    avatar: 'http://farm'+comment.iconfarm+'.staticflickr.com/'+comment.iconserver+'/buddyicons/'+comment.author+'.jpg',
                    name: comment.authorname,
                    content: comment._content,
                    time: comment.datecreate
                });
            });
        }
        return {
            commentList: target
        };
    };
    
    $.GalleryData.adapter.comments = function(data){
        return $.extend($.GalleryData.adapter.comment(data.comment), {
            page: data.page,
            perPage: data.perpage,
            total: data.total
        });
        
    };
})();
