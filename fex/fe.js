baidu(function(){
    Function.prototype.bind = function(context) {
        var _this = this;
        return function(){
            return _this.apply(context);
        }
    }

    baidu.dom.extend( {
        indexOf: function( $dom ) {
            if(!this.length) return -1;
            for(var i = 0; i < $dom.length; i++){
                if(this[0] == $dom[i]) return i;
            }
            return -1;
        }
    });

    baidu.fx.easing.ease = function(t) {
        return Math.pow(t, 0.7);
    }

    function Event() {
        this._event = {};
        this.on = function ( name, callback ) {            
            var callbacks = this._event[name] = this._event[name] || baidu.Callbacks();
            callbacks.add(callback);
            return this;
        };
        this.fire = function( name, args ) {
            if(!this._event[name]) return;
            //console.log(this, name, args);
            this._event[name].fireWith( this, args );
            return this;
        };
        this.fireBefore = function( name, args ) {
            this.fire('before' + name, args);
        }
        this.fireAfter = function( name, args ) {
            this.fire('after' + name, args);
        }
    }

    function Screen( index, stage, dom ) {
        Event.apply(this);
        this.index = index;
        this.stage = stage;
        this.dom = dom;
        if ( !Screen.__initialized__ ) {
            Screen.prototype.find = function( selector ) {
                return baidu(this.dom).find( selector );
            }
            Screen.prototype.init = function( fn ) {
                fn.apply(this);
                return this;
            }
            Screen.prototype.fit = function( selector, type ) {
                var elem = this.find(selector);
                var stage = this.stage;
                var max = Math.max, min = Math.min;
                function onresize() {
                    var cw = stage.width(), ch = stage.height(),
                        w = elem.width(), h = elem.height(), scale = Math.max(ch / h, cw/w);
                    elem.css({
                        left: ( cw - w ) / 2,
                        '-webkit-transform': 'scale(' + scale + ')',
                           '-moz-transform': 'scale(' + scale + ')',
                            '-ms-transform': 'scale(' + scale + ')',
                             '-o-transform': 'scale(' + scale + ')',
                                'transform': 'scale(' + scale + ')',
                        bottom: (scale - 1) / 2 * h
                    });
                };
                this.on('resize', onresize);
                this.on('beforeshow', onresize);
                onresize();
                return elem;
            }
            Screen.__initialized__  = true;
        }        
    }

    function Stage() {  
        Event.apply(this); 

        var _nav = baidu('#top-nav'),
            _currentScreenIndex = 0, _maxScreenIndex = baidu('.screen').length,
            _isChanging = false,
            _stage = this,
            _changing = false;

        var _screens = baidu('.screen').map( function ( index, dom ) {
            return new Screen( index, _stage, dom );
        });

        this.getScreen = function( index ) {
            return _screens[index];
        };        

        function fireScreenEvent ( index, name, args ) {
            if(_screens[index]) _screens[index].fire(name, args)
        }

        this.width = function() {
            return document.body.clientWidth;
        };

        this.height = function() {
            return document.body.clientHeight;
        }

        this.changeScreen = function( index ) {
            var oldIndex = _currentScreenIndex || 0,
                newIndex = index;
            if ( _changing ) return;
            if ( newIndex >= 0 && newIndex < _maxScreenIndex ) {
                _currentScreenIndex = newIndex;
                _changing = true;
                _stage.fire('change', [newIndex, oldIndex]);
            }
        }

        function buildEvents() {
            // change event by wheel
            baidu( 'body' ).on( 'mousewheel', function(e) {
                _stage.changeScreen(_currentScreenIndex + (e.wheelDelta < 0 ? 1 : -1))
            });

            // change event by nav
            baidu('#top-nav #menu ul li').click(function(e){
                var $target = baidu(e.target);
                if( _currentScreenIndex != $target.attr('screen') ) {
                    _stage.changeScreen( +$target.attr('screen') );
                }
            });

            // resize event
            baidu( window ).on( 'resize', function() {
                _stage.fire( 'resize', [document.body.clientWidth, document.body.clientHeight] );
            } );

            baidu( 'body' ).on( 'keydown', function(e) {
                _stage.fire( 'navigate', [e.keyIdentifier] );
            });

            _stage.on( 'navigate', function(direction) {
                var stoped = false;
                var e = { direction: direction, stopPropagation: function(){ stoped = true; } };
                fireScreenEvent( _currentScreenIndex,'navigate', [e] );
                if(stoped) return;
                switch(direction) {
                    case "Up":
                        _stage.changeScreen(_currentScreenIndex - 1);
                        break;
                    case "Down":
                        _stage.changeScreen(_currentScreenIndex + 1);
                        break;
                }
            });
        }

        buildEvents();

        // 快捷方式
        this.on('change', function( newIndex, oldIndex ) {
            oldIndex = oldIndex === undefined ? _currentScreenIndex : oldIndex;
        });

        // 所有屏幕的高度适应
        this.on('resize', function( width, height ) {
            var offset = _nav.height();
            baidu('.screen').css({
                'height' : height - offset,
                'padding-top' : offset
            });
            baidu('body').scrollTop(_stage.height() * _currentScreenIndex);
        });

        // 传播事件给屏幕
        this.on('resize', function ( width, height ) {
            fireScreenEvent(_currentScreenIndex, 'resize', [width, height]);
        });

        // 导航条位置适应
        this.on('resize', function( width, height ) {
            _nav.css({
                top: _currentScreenIndex == 0 ? height - _nav.height() : 0
            });
        });

        // 屏幕滚动
        this.on('change', function( newIndex, oldIndex ) {
            _stage.fire('beforehide', [oldIndex]);
            _stage.fire('beforeshow', [newIndex]);
            baidu('body').animate({
                scrollTop : _stage.height() * newIndex
            }, {
                duration: 800, 
                ease : 'ease',
                progress : function( e, progress ) {
                    _stage.fire('changeprogress', [ {
                        progress : progress,
                        targetScreen : newIndex, 
                        sourceScreen : oldIndex,
                        scrollTop: e.elem.scrollTop
                    } ]);
                },
                complete: function() { 
                    _changing = false; 
                    _stage.fire('afterhide', [oldIndex]);
                    _stage.fire('aftershow', [newIndex]);
                }
            });
        });

        // 导航条位置适应
        this.on('change', function( index ) {
            _nav.animate({
                "top" : index == 0 ? this.height() - _nav.height() : 0
            }, 800);
        });

        // 更新导航当前项
        this.on('aftershow', function( index ) {
            baidu('#top-nav #menu ul li.current').removeClass('current');
            baidu('#top-nav #menu ul li[screen=' + _currentScreenIndex + ']').addClass('current');
        });

        // 传播事件
        this.on('beforeshow', function(index) {
            fireScreenEvent(index, 'beforeshow');
        });
        this.on('aftershow', function(index) {
            fireScreenEvent(index, 'aftershow');
        });
        this.on('beforehide', function(index) {
            fireScreenEvent(index, 'beforehide');
        });
        this.on('afterhide', function(index) {
            fireScreenEvent(index, 'afterhide');
        });

        // 传播事件
        this.on('changeprogress', function(e) {
            fireScreenEvent(e.targetScreen, 'activing', [e.progress]);
            fireScreenEvent(e.sourceScreen, 'deactiving', [e.progress]);
        });

        this.on('changeprogress', function(e) {
            var index = Math.min(e.sourceScreen, e.targetScreen);
            var dom = _screens[index] && _screens[index].dom;
            if(!dom) return;
            baidu(dom).css('top', (document.body.scrollTop - _stage.height() * index) * 0.618);
        });

        this.start = function() {
            this.fire('resize', [this.width(), this.height()]);
            this.fire('change', [0, -1]);
        }
    }

    function SlideShow( container, delay ) {
        Event.apply(this);
        var container = baidu.dom(container);
        var slides = container.children().addClass('hide');
        var current_index = -1;
        var delay = delay || 1000;
        this.show = function(comming_index) {
            this.fireBefore('show', [current_index, comming_index]);
            var current = slides.eq(current_index),
                comming = slides.eq(comming_index);

            if ( current ) {
                current.removeClass('show from-right from-left');
                current.addClass(comming_index > current_index ? 'hide to-left' : 'hide to-right');
            }
            comming.removeClass('hide to-left to-right');
            comming.addClass(comming_index > current_index ? 'show from-right' : 'show from-left');

            current_index = comming_index;
            this.fire('show');
        };
        this.next = function() {
            if ( this.hasNext() ) this.show(current_index + 1);
        };
        this.prev = function() {
            if ( this.hasPrev() ) this.show(current_index - 1);
        };
        this.hasNext = function() {
            return current_index < slides.length - 1;
        }
        this.hasPrev = function() {
            return current_index > 0;
        }
    }

    Stage.DEBUG = false;

    var stage = new Stage();

    // 首屏交互
    stage.getScreen(0)

        .init(function(){
            var screen = this;
            this.light = (function(){
                var circles = screen.find('.circle1, .circle2, .circle3, .circle4')
                var timeouts = [];
                return {
                    on: function() {
                        if(timeouts.length) return;
                        circles.css('display', 'block').each(function(index, dom) {
                            var circle = baidu(dom);
                            function update() {
                                circle.css({
                                    left: (200 + stage.width()) * Math.random() - 400,
                                    top: (200 + stage.height()) * Math.random() - 400
                                });
                                timeouts.push(setTimeout(update, Math.random() * 10000));
                            }
                            update();
                        });
                    },
                    off: function() {
                        while(timeouts.length) clearTimeout(timeouts.pop());
                        circles.css('display', 'none');
                    }
                }                
            })();
            this.light.on();

            this.down = this.find('.nav.down').click(function(){
                stage.changeScreen(1);
            });

        })

        .on('beforeshow', function(){
            this.light.on();
        })

        .on('afterhide', function(){
            this.light.off();
        })

        .on('beforehide', function(){            
            this.down.css('bottom', -120)
        })

        .on('aftershow', function(){            
            this.down.css('bottom', 100);
        });

    stage.getScreen(1)

        .init( function(){
            this.find('p').click(function(e){
                var index = +baidu(e.target).attr('topic-index');
                stage.getScreen(2).slideShow.show(index);
                stage.changeScreen(2);
            });
        })

    // 第一屏（产品）交互
    stage.getScreen(2)

        .init(function(){
            var prev = this.prev = this.find('.nav.prev'),
                next = this.next = this.find('.nav.next');

            var slideShow = this.slideShow = new SlideShow('#topic-container');
            this.fit('#topic-container');
            slideShow.on('show', function() {
                this.hasPrev() ? prev.show() : prev.hide();
                this.hasNext() ? next.show() : next.hide();
            });
            slideShow.show(0);
            function goNext(){ slideShow.next(); }
            function goPrev(){ slideShow.prev(); }
            next.click(goNext);
            prev.click(goPrev);
            this.on('navigate', function(e){
                switch(e.direction) {
                    case 'Left': return goPrev();
                    case 'Right': return goNext();
                }
            });

            var cat = this.cat = this.find('#catalog');
            this.find('#catalog p').click();
        })

        .on('aftershow', function() {
            this.prev.delay(100).animate( { 'left': 50 }, 200 );
            this.next.delay(100).animate( { 'right': 50 }, 200 );
        })

        .on('beforehide', function(){     
            this.prev.animate( { 'left': -150 }, 200 );
            this.next.animate( { 'right': -150 }, 200 );
        });

    // 第二屏（大牛）交互
    stage.getScreen(3)
        .init(function(){
            this.members = this.find('.team-member');
            this.left = function() {
                return (stage.width() - this.members.outerWidth() * this.members.length) / 2 + 20
            }
            this.middle = function() {
                return (stage.width() - this.members.width()) / 2;
            }
            this.layout = function() {
                var s = this;
                s.members.each(function(index, dom){
                    var m = baidu(dom);
                    m.stop().animate({
                        left: s.left() + index * m.width(),
                        opacity: 1
                    }, 300);
                });
            }

            this.shower = this.fit('#member-show');
            this.slideShow = new SlideShow('#member-show');
            var _this = this;
            var members = this.members
                .on('mouseenter', function(e){
                    _this.find('h1').fadeOut();
                    var target = baidu(e.target);
                    var index = target.indexOf(members);
                    _this.slideShow.show(index);
                    members.filter('.current').removeClass('current');
                    target.addClass('current');
                });
        })
        .on('resize', function(width){
            this.layout();
        })
        .on('aftershow', function(){
            this.members.css('left', this.middle());
            this.layout();
        })
        .on('beforehide', function(){
            this.members.animate({opacity: 0});
        })
    
    // 第三屏（成员）交互
    stage.getScreen(4)
        .init(function(){            
            var _this = this;
            var little_container = this.find('#little-container');
            var moutain = this.find('#moutain-layer');
            var ground = this.find('#ground-layer');
            var dialog = this.find('#dialog');
            var ly = 0, lx = 0;
            var last_index;
            var mcount = 33;
            var data;

            baidu.ajax({
                url: 'fex/member/data.json',
                dataType: 'json',
                success: function( json ) {
                    data = json;
                }
            });

            var seq = [];
            for(var i = 0; i < mcount; i++) seq.push(i);
            seq.sort(function(){return Math.random() > 0.5 ? 1 : -1;});

            for(var i = 0; i < mcount; i++) {
                baidu('<div class="little-man" style="background-image: url(fex/member/' + seq[i] + '.png)" index="' + seq[i] + '"></div>').appendTo(little_container);
            }
            var little_men = this.find('.little-man');

            baidu(_this.dom).on('mousemove', function update(e){
                var pd = 200,
                    sw = stage.width(),
                    cw = little_container.width(),
                    pd2 = pd * sw / cw,
                    cl = (sw - cw - pd * 2) * e.x / sw + pd;
                little_container.css('left', cl);
                
                moutain.css('background-position-x', -e.x * 0.4);
                
            });
            
            var last_timeouts = [];
            window.MEN_DELAY = [800, 400];
            little_men.on('mouseenter', function(e){
                var target = baidu(e.target);
                var index = +target.attr('index');

                little_men.removeClass('stand see-left see-right');                
                dialog.fadeOut();

                while(last_timeouts.length) clearTimeout(last_timeouts.pop());

                last_timeouts.push(setTimeout(function(){
                    var prev = target.prev(), next = target.next();
                    function autoPrev () {
                        prev.addClass('see-right');
                        prev = prev.prev();
                        if(prev.length) last_timeouts.push(setTimeout(autoPrev, 50));
                    }
                    function autoNext () {
                        next.addClass('see-left');
                        next = next.next();
                        if(next.length) last_timeouts.push(setTimeout(autoNext, 50));
                    }
                    autoPrev();
                    autoNext();
                }, MEN_DELAY[0]));

                last_timeouts.push(setTimeout(function(){
                    var left = target.position().left - target.width() / 2 + target.parent().position().left - 10;
                    target.addClass('stand');
                    dialog.css( { 'left': left });
                    dialog.fadeIn();
                    if (data) {
                        dialog.html('<h1>' + data[index][0] + '</h1><p>' + data[index][1] + '</p>');
                    }
                }, MEN_DELAY[1]));
            });
            little_container.on('mouseleave', function(e){             
                little_men.removeClass('stand see-left see-right');
                dialog.fadeOut();
                while(last_timeouts.length) clearTimeout(last_timeouts.pop());                
            });
        })
        .on('aftershow', function(e){
        })
        .on('beforehide', function(e){
        });

    // 第四屏（关注）交互
    stage.getScreen(5)
        .init(function(){
            this.github = this.find('#github').addClass('hide');
        })
        .on('aftershow', function(){
            this.github.removeClass('hide');
        })
        .on('beforehide', function(){
            this.github.addClass('hide');
        })
    stage.start();

    // 调整 github 的位置
    baidu(".s4").click(function(){

        console.log(baidu("#weixin").scrollTop());

    });
    
});