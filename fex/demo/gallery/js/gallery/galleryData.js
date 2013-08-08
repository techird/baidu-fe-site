void function(){
	/**
	 * @desc 提供所需的数据接口
	 * @param {Object} config
	 * @param {Object} data
	 * @param {Object} main
	 */
    $.GalleryData = function(config, data, main){
        // this.savedData = [];
        this.config = $.extend({
            commentsPerPage: 10,
            photosPerPage: 20
        }, config);
        this.main = main;
        this.data = data;
        this.setId = config.setId;
        this.savedData = {};
        this.setData(data.syncData);
    }
    $.extend($.GalleryData.prototype, {
        fetch: function(data, page, cb){
            var that = this;
            $.ajax({
                url: $.GalleryData.adapter.url.getPhotos,
                method: 'GET',
                dataType: 'json',
                data: data,
                success: function(rsp){
                    that.savedData[page].data = rsp;
                    cb && cb();
                }
            });
        },
        
        getPhoto: function(index, cb){
            var pageInfo = this.getPageByIndex(index),
                page = pageInfo.page,
                indexInPage = pageInfo.indexInPage,
                that = this;

            if(!this.savedData[page]){
                this.savedData[page] = {};
                this.savedData[page].cbcache = [];
                this.savedData[page].status = 'loading';
                this.fetch($.GalleryData.adapter.query.photo.apply(this, [page]), page, function(){
                    cb && cb(that.getPhotoDataByIndex(index));
                    that.savedData[page].status = 'loaded';
                    var fn;
                    while(fn = that.savedData[page].cbcache.shift()){
                        fn(that.getPhotoDataByIndex(fn.index));
                    }
                });
                
            }else if(this.savedData[page].status === 'loading'){
                cb.index = index;
                this.savedData[page].cbcache.push(cb);
                
            }else if(this.savedData[page].data[indexInPage]){
                cb(this.savedData[page].data[indexInPage]);
            }
        },
        
        getPageByIndex: function(index){
            return{
                page: Math.ceil( (+index + 1) / this.config.photosPerPage ),
                indexInPage: index % this.config.photosPerPage
            }
        },
        
        getComment: function(photoIndex, page, cb){
            var that = this;
            $.ajax({
                url: $.GalleryData.adapter.url.getComments,
                method: 'GET',
                dataType: 'json',
                data: $.GalleryData.adapter.query.comments.apply(this, [page, this.getId(photoIndex)]),
                success: function(rsp){
                    cb && cb(that.filter(rsp, 'comments'));
                }
            });
        },
        
        getPhotoDataByIndex: function(index){
            var pageInfo = this.getPageByIndex(index),
                data = this.savedData[pageInfo.page].data[pageInfo.indexInPage];
            return this.filter(data, 'photo');
        },
        
        getId: function(index){
            return this.getPhotoDataByIndex(index).id;
        },
        
        getIndex: function(id){
            return this.ref[id];
        },
        
        destroy: function(){
            this.savedData = [];
        },
        
        filter: function(data, api){
            return $.GalleryData.adapter[api](data);
        },
        
        setCurrentIndex: function(){
        	
        },
        
        setData: function(list){
            if(list && list.length){
                var that = this;
                list.forEach(function(photo){
                    that.savedData[photo.index] = photo;
                });
            }
        }
    });
/*
    $.GalleryData = function(config, data, main){
        // this.savedData = [];
        this.config = $.extend({
            commentsPerPage: 10,
            photosPerPage: 20
        }, config);
        this.main = main;
        this.data = data;
        this.savedData = {
            // page: {data: {indexInPage: photo}}
            // index: photo
        };
        this.setData(data.syncData);
        
        
    };
    $.extend($.GalleryData.prototype, {
        fetch: function(data, cb){
            var that = this;
            $.ajax({
                url: $.GalleryData.adapter.url.getPhotos,
                method: 'GET',
                dataType: 'json',
                data: data,
                success: function(rsp){
                    that.data.title = rsp.data.title;
                    rsp = rsp.data.pics;
                    // that.savedData[page].data = rsp;
                    that.setData(rsp);
                    cb && cb();
                }
            });
        },
        hasPhoto: function(index){
            return this.savedData[index];
        },
        getPhoto: function(index, cb){
            var that = this;
            if(this.hasPhoto(index)){
                cb(this.getPhotoByIndex(index));
            }else if(this.status == 'loading'){
                setTimeout(function(){
                    that.getPhoto.call(that, index, cb);
                }, 50);
            }else if(this.status !== 'loading'){
                var id = this.getId(index);
                index = id.index;
                id = id.id;
                this.status = 'loading';
                var fetchQuery = $.GalleryData.adapter.query.photo.apply(this, [id, index]);

                this.fetch(fetchQuery, function(){
                    cb && cb(that.getPhotoByIndex(index));
                    that.status = 'loaded';
                });
            }
        },
        
        asyncGetIndex: function(id, cb){
            var that = this,
                fetchQuery = $.GalleryData.adapter.query.photo.apply(this, [id]);
            this.fetch(fetchQuery, function(){
                cb && cb(that.getIndex(id));
            });
        },
        
        getPageByIndex: function(index){
            return{
                page: Math.ceil( (+index + 1) / this.config.photosPerPage ),
                indexInPage: index % this.config.photosPerPage
            };
        },
        
        getComment: function(photoIndex, page, cb){
            var that = this;
            $.ajax({
                url: $.GalleryData.adapter.url.getComments,
                method: 'GET',
                dataType: 'json',
                data: $.GalleryData.adapter.query.comments.apply(this, [page, this.getId(photoIndex).id ]),
                success: function(rsp){
                    // FIXME hack for a incorrect rsp.pn
                    // rsp.data.pn = page;
					that.data.tbs = rsp.data.tbs;
					that.data.fid = rsp.data.fid;
					that.data.commentType = rsp.data.type;
                    cb && cb(that.filter(rsp, 'comments'));
                }
            });
        },
        
        postComment: function(data){
        	var postData = {
				tbs: this.data.tbs,
				fid: this.data.fid,
				kw: this.data.kw,
				tid: this.data.tid,
				commentType: this.data.commentType,
				rich_text: 1,
				anonymous: 0,
				pic_id: this.data.currentId,
				quote_id: 0
			},
			url = $.GalleryData.adapter.url.postComment,
			that = this;
			$.extend(postData, data);
			
			switch (postData.commentType) {
				case 0:
					break;
				case 1:
					postData['is_lzl'] = 1;
					postData['quote_id'] = this.getPhotoByIndex(this.data.currentIndex).pid;
					break;
				case 2:
					url = $.GalleryData.adapter.url.postPhotoComment;
					break;
			}
			
			var add_thread = function(url, postData){
				that.main.dispatcher.trigger('gallery:postComment/before');
		        TbPad.api.post(url, postData, {
		            'success' : function(data){
		                that.main.dispatcher.trigger('gallery:postComment/success');
		            },
		            'error' : function(error, data, error_no){
	            		that.main.dispatcher.trigger('gallery:postComment/error', {
	            			repost: add_thread,
	            			url: url,
	            			postData: postData,
	            			inputEl: $(that.main.el.commentInput),
	            			error: error,
	            			data: data,
	            			error_no: error_no
	            		});
		            }
		        });
		    };
		    add_thread(url, postData);
        },
        
        getPhotoByIndex: function(index){
            return this.filter(this.savedData[index], 'photo');
        },
        
        getId: function(index){
            var result = {index: index};
            if(this.hasPhoto(index)){
                result.id = this.getPhotoByIndex(index).id;
            }else{
                var distance = 0;
                while(++distance < this.data.total){
                    if(this.hasPhoto(index + distance)){
                        result.id = this.getPhotoByIndex(index + distance).id;
                        result.index = index + distance;
                        break;
                    }else if(this.hasPhoto(index - distance)){
                        result.id = this.getPhotoByIndex(index - distance).id;
                        result.index = index - distance;
                        break;
                    }
                }
            }
            return result;
        },
        
        getIndex: function(id){
            var result = null;
            for(var i in this.savedData){
                if(this.savedData[i].id == id || this.savedData[i].url.indexOf(id) != -1){
                    result = +i;
                    break;
                }
            }
            return result;
        },
        
        destroy: function(){
            this.savedData = {};
        },
        
        filter: function(data, api){
            return $.GalleryData.adapter[api].call(this, data);
        },
        
        setData: function(list){
            if(list && list.length){
                var that = this;
                list.forEach(function(photo){
                    that.savedData[photo.index] = photo;
                });
            }
        },
        
        setCurrentIndex: function(index){
        	var idInfo = this.getId(index);
			this.data.currentIndex = index;
        	if(idInfo.index == index){
        		this.data.currentId = idInfo.id;
        	}else{
        		throw new Error("GET ID ERROR");
        	}
        },
        
        getNextCollection: function(cb){
        	$.get($.GalleryData.adapter.url.getPhotos, {
        		type: 'recommend',
        		kw: this.data.kw,
        		tid: this.data.tid
        	}, function(rsp){
        		cb && cb(rsp);
        	}, 'json');
        },
        
        addFav: function(uid, index, cb){
			var photo = this.getPhotoByIndex(index),
        		url = photo.url;
            
            $.getJSON($.GalleryData.adapter.url.postFav, $.GalleryData.adapter.query.fav.apply(this, [{
            	uid: uid,
            	url: url
            }]), function(rsp){
            	cb && cb(rsp);
            });
        }
    });
*/    
   
}();
