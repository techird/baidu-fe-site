/**
 * @desc gallery 核心功能调度 
 */
(function() {
    var Timer = {
        saver : {},
        set : function(key, fn, delay) {
            this.saver[key] = setTimeout(fn, delay);
        },
        clear : function(key) {
            clearTimeout(this.saver[key]);
        },
        tid : 0,
        setTransitoinEnd : function(node, fn, duration) {
            var id = this.tid++, that = this, callback = function() {
                if (that.saver[id]){
                    return;
                }
                fn.call(node);
                that.saver[id] = true;
            };
            that.saver[id] = false;
            $(node).one('webkitTransitionEnd', callback);
            setTimeout(callback, duration);
        }
    }, 
    Gallery = $.GalleryCore = function(dispatcher, dataAPI, config) {
        this.dispatcher = dispatcher;
        this.dataAPI = dataAPI,
        this.config = config;
        this.total = +config.total;
        this.data = {
            /** index: obj **/
        };
        this.eventsList = [];
        this.el = {
            container : $(config.el).size() ? $(config.el) : $(document.body)
        };
        this.instance = {};
        this.init(config.index);
    };

    (function($, Gallery) {
        var that = null, 
        tmpl = {
            main: _.template('<div id="gallery" class="hide">'+
                    '<div id="gallery-slider"></div>' + 
                    '<div id="gallery-operation">' + 
                        '<nav id="gallery-thumbnail"><ul></ul></nav>' + 
                    '</div>' + 
                '</div>')
        },
        
        render = function() {
            var htmlStr = tmpl.main();
            that.el.container.append($(htmlStr));
            that.el.main = $('#gallery');
            that.el.slider = $('#gallery-slider');
            that.el.thumbnail = $('#gallery-thumbnail');
            that.el.operation = $('#gallery-operation');
        }, 
        
        sliderInstaller = {
            install : function() {
                that.instance.slider = that.el.slider.slider({
                    initIndex : -1
                }, that.dispatcher);
                that.instance.slider.setOption({
                    onBeforeDrag : function(index, e) {
                        var result;
                        try {
                            result = that.instance.scale.canSlide(e.gesture.deltaX);
                        } catch(e) {
                            result = true;
                        }
                        return result;
                    }
                });
            },
            uninstall : function() {
                that.instance.slider && that.instance.slider.destroy();
            },
            reinstall : function() {
                this.uninstall();
                this.install();
            }
        }, 
        
        thumbnailInstaller = {
            install : function() {
                that.instance.thumbnail = that.el.thumbnail.thumbnail({}, that.dispatcher);
            }
        }, 
        
        scaleableInstaller = {
            target : null,
            install : function(img) {
                var offset = {},
                	index = $(img)[0].dataset.index,
                	backable = false;
                if (that.instance.slider.getCurrentIndex() != index){
                    return;
                }
                this.uninstall();
                this.target = img;
                that.instance.scale = this.target.scaleable({
                    doubleTapZoomIn : true,
                    doubleTapZoomRestore : true,
                    dragableOnEnlarged : true,
                    min : .1,
                    slider : that.instance.slider,
                    doubleTapRestoreHandler : $(img).parent()
                }, that.dispatcher);
                that.instance.scale.setOption({
                    onTransformEnd : function(e, scale, relativeScale) {
                    	if(scale < 1){
	                        if (scale < .7 && backable) {
	                            that.dispatcher.trigger('gallery:scaleable/scaleback', scale);
	                        }
	                        that.instance.scale.restore();
                        }
                    },
                    onTransformStart : function(e, scale, relativeScale) {
                    	backable = scale == 1 ? true : false;
                        offset = this.offset();
                        Timer.set('transformEnd', function() {
                            toolbarCtrl.hide();
                        }, 100);
                    }
                });
                that.instance.scale.init();
            },
            uninstall : function() {
                that.instance.scale && that.instance.scale.destroy();
            },
            reinstall : function() {
                that.instance.scale && this.install(this.target);
            }
        }, 
        
        bindEvent = function() {
            var slider = that.instance.slider,
                thumbnail = that.instance.thumbnail,
            eventHandler = function(e) {
                switch(e.type) {
                    case 'tap':
                        Timer.set('sliderTap', function() {
                            toolbarCtrl.isHide() ? toolbarCtrl.show() : toolbarCtrl.hide();
                        }, 200);
                        break;
                }
            };
            
            that.bindEvent(that.dispatcher, 'gallery:thumb/itemTap', function(item, newIndex, oldIndex){
                if (isNaN(newIndex) || newIndex == oldIndex){
                    return;
                }
                that.dispatcher.trigger('gallery:beforeSwitch', newIndex);
                slider.moveTo(newIndex, false, false);
                afterSwitchHandler(newIndex, oldIndex, 'thumb');
            });
            
            that.bindEvent(that.dispatcher, 'gallery:thumb/move', function(startIndex, endIndex, dir){
                fetchData(startIndex, endIndex);
            });
            
            that.bindEvent(that.dispatcher, 'gallery:slider/afterSwitch', afterSwitchHandler);

            that.bindEvent(that.dispatcher, 'gallery:slider/beforeSwitch', function(newIndex) {
                that.dispatcher.trigger('gallery:beforeSwitch', newIndex);
                thumbnail.moveTo(newIndex);
            });

            that.bindEvent(that.dispatcher, 'gallery:scaleable/doubletap', function() {
                Timer.clear('sliderTap');
                toolbarCtrl.hide();
            });
            
            that.bindEvent(Hammer(that.el.slider[0]), 'tap', eventHandler);

            that.bindEvent($(window), 'orientationchange', function(e) {
                try {
                    slider.afterResize();
                    thumbnail.afterResize();
                    that.instance.scale.restore(true);
                    scaleableInstaller.reinstall();
                } catch(e) {}
            });
        }, 
        
        setData = function(data, index, callback) {
            var newData = {};
            newData[index] = data;
            that.instance.thumbnail.setData(newData);
            that.instance.slider.setData(newData);
            if (!that.data[index]) {
                that.data[index] = data;
            }
            callback && callback();
        }, 
        fetchData = function(startIndex, endIndex, callback) {
            if (startIndex != endIndex) {
                startIndex = Math.max(startIndex - 5, 0);
                endIndex = Math.min(endIndex + 5, that.total - 1);
            }

            while (startIndex <= endIndex) {
                if (!that.data[startIndex]) {
                    that.dataAPI.getPhoto(startIndex, function(startIndex){
                        return function(data){
                            setData(data, startIndex, callback);
                        };
                    }(startIndex));
                } else {
                    setData(that.data[startIndex], startIndex, callback);
                }
                startIndex++;
            }
        }, 
        imageLoader = {
            getImg : function(index) {
                var img = new Image(),
                    url = that.data[index].url;
                img.draggable = false;
                img.dataset.index = index;
                img.src = url;
                return img;
            },
            load : function(index, callback) {
                if (this.valid(index)) {
                    var img = this.getImg(index), 
                    loadedCallback = function(loadedImg) {
                        var pane = $(that.instance.slider.getPane(index));
                        if (pane.find('img').size()){
                            return;
                        }
                        if (this.src) {
                            // unloaded
                            that.data[index].loaded = true;
                            that.data[index].loading = false;
                            imageLoader.imgOnLoad(this, pane, index);
                            callback && callback();
                        }
                    };
                    $(img).on('load', loadedCallback);
                    that.data[index].loading = true;
                }
            },
            isLoaded : function(index) {
                return that.data[index].loaded;
            },
            isLoading : function(index) {
                return that.data[index].loading;
            },
            preLoad : function(index, offset) {
                while (offset) {
                    this.load(index + offset);
                    this.load(index - offset);
                    offset--;
                }
            },
            valid : function(index) {
                return that.data[index];
            },
            setFunctional : function(from) {
                // context: img
                $(this).removeClass('loaded').css('-webkit-transform-origin', '0 0').css('-webkit-transform', 'translate3d(0, 0, 0)');
                scaleableInstaller.install($(this));
            },
            imgOnLoad : function(img, pane, index) {
                if (!$(pane).find('img').size()) {
                    $(pane).empty();
                    $(pane).append(img);
                    $(img).addClass('loaded');
                    $(img).one('webkitAnimationEnd', this.setFunctional);
                }
            },
            setLoadedImg : function(img, pane, index, from) {
                if (from == 'thumb') {
                    this.imgOnLoad(img, pane, index);
                } else {
                    img = $(that.instance.slider.getCurrentPane()).find('img');

                    // Hack to get the image is in transition or not
                    var isInAnim = getComputedStyle(img[0]).opacity < 1;
                    if (isInAnim) {
                        Timer.setTransitoinEnd(img, function() {
                            imageLoader.setFunctional.call(img);
                        }, 400);
                    } else {
                        this.setFunctional.call(img);
                    }

                }
            }
        }, 
        
        afterSwitchHandler = function(newIndex, oldIndex, from) {
            that.dispatcher.trigger('gallery:afterSwitch', newIndex);
            that.currentIndex = newIndex;
            var currentPane = $(that.instance.slider.getPane(newIndex));
            scaleableInstaller.uninstall();

            if (currentPane.find('img').size()) {
                imageLoader.setLoadedImg(imageLoader.getImg(newIndex), currentPane, newIndex, from);
                imageLoader.preLoad(newIndex, 2);
            } else {
                imageLoader.load(newIndex, function() {
                    imageLoader.preLoad(newIndex, 2);
                });
            }
        },
        
        toolbarCtrl = {
            show : function() {
                that.dispatcher.trigger('gallery:showThumbnail');
                that.el.operation.removeClass('hide');
            },
            hide : function() {
                that.dispatcher.trigger('gallery:hideThumbnail');
                that.el.operation.addClass('hide');
            },
            isHide : function() {
                return that.el.operation.hasClass('hide');
            }
        };

        $.extend(Gallery.prototype, {

            init : function(index) {
                if (!isNaN(index) && !location.hash) {
                    location.hash = '/gallery/' + index;
                }

                that = this;
                render();

                thumbnailInstaller.install();
                sliderInstaller.install();
                bindEvent();

                // TODO
                that.instance.slider.init(that.config.total);
                that.instance.thumbnail.init(that.config.total);
                that.instance.slider.setData({});
                that.instance.thumbnail.setData({});

                // router.on('route:gallery', function(index) {
                    // if (!index || isNaN(index)) {
                        // index = 0;
                    // }
                    // that.goToPage(index);
                // });
                // Backbone.history.start();
            },
            
            ready: function(total){
                // TODO
                thumbnailInstaller.install();
                sliderInstaller.install();
                bindEvent();
                that.instance.slider.init(that.config.total);
                that.instance.thumbnail.init(that.config.total);
                that.instance.slider.setData({});
                that.instance.thumbnail.setData({});
            },
            
            bindEvent: function(obj, name, handler){
                this.eventsList.push({
                    obj: obj,
                    name: name,
                    handler: handler
                });
                obj.on(name, handler);
            },
            
            switchTo : function(index) {
                index = +index;
                if (isNaN(index) || index < 0 || index >= this.total || this.currentIndex == index){
                    return;
                }
                fetchData(index, index, function() {
                    that.instance.thumbnail.moveTo(index);
                    that.dispatcher.trigger('gallery:beforeSwitch', index);
                    that.instance.slider.moveTo(index);
                });

                that.instance.thumbnail.moveTo(index);
            },

            nextPage : function() {
                if (this.instance.slider.hasNext()){
                    this.instance.slider.next();
                }
                else{
                    this.instance.slider.immovableHint();
                }
            },

            prevPage : function() {
                if (this.instance.slider.hasPrev()){
                    this.instance.slider.prev();
                }
                else{
                    this.instance.slider.immovableHint();
                }    
            },

            showThumbnail : function() {
                toolbarCtrl.show();
            },

            hideThumbnail : function() {
                toolbarCtrl.hide();
            },

            toggleThumbnail : function() {
                if (toolbarCtrl.isHide()){
                    toolbarCtrl.show();
                }
                else{
                    toolbarCtrl.hide();
                }
            },

            getCurrentIndex : function() {
                return this.currentIndex;
            },
            
            show: function(){
                this.el.main.removeClass('hide');
            },
            
            hide: function(){
                this.el.main.addClass('hide');
            },
            
            destroy: function(){
                this.eventsList.forEach(function(e){
                    e.obj.off(e.name, e.handler);
                });
                try{
                    this.instance.scale.destroy();
                    this.instance.slider.destroy();
                    this.instance.thumbnail.destroy();
                }catch(e){}
                this.dataAPI = null;
            }
        });
    })(Zepto, Gallery);
})(); 