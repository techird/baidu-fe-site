Function.prototype.bind = function(context) {
    var _this = this;
    return function() {
        return _this.apply(context, arguments);
    }
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

baidu(function(){    

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
                        w = elem.width(), h = elem.height(), 
                        scale = {
                            all: Math.max(ch / h, cw / w),
                            height: ch / h,
                            width: cw / w   
                        }[type || 'all'];
                    elem.css({
                        translateX: ( cw - w ) / 2,
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
            return document.documentElement.clientWidth;
        };

        this.height = function() {
            return document.documentElement.clientHeight;
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
                if( splash.isVisible() ) return;
                _stage.changeScreen(_currentScreenIndex + (e.wheelDelta < 0 ? 1 : -1))
            });

            // change event by nav
            baidu('#top-nav #menu ul li').click(function(e){
                if( splash.isVisible() ) return;
                var $target = baidu(e.target);
                if( _currentScreenIndex != $target.attr('screen') ) {
                    _stage.changeScreen( +$target.attr('screen') );
                }
            });

            // resize event
            baidu( window ).on( 'resize', function() {
                _stage.fire( 'resize', [document.documentElement.clientWidth, document.documentElement.clientHeight] );
            } );

            baidu( 'body' ).on( 'keydown', function(e) {
                if( splash.isVisible() ) return;
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
            baidu('#stage').cssAnimate( {
                "translateY" : - _stage.height() * _currentScreenIndex
            });
        });

        // 传播事件给屏幕
        this.on('resize', function ( width, height ) {
            fireScreenEvent(_currentScreenIndex, 'resize', [width, height]);
        });

        // 导航条位置适应
        this.on('resize', function( width, height ) {
            var top = _currentScreenIndex == 0 ? height - _nav.height() : 0;
            _nav.css3({
                translateY: top
            });
            baidu('body > #logo').css3('translateY', top);
        });

        // 屏幕滚动
        this.on('change', function( newIndex, oldIndex ) {
            _stage.fire('beforehide', [oldIndex]);
            _stage.fire('beforeshow', [newIndex]);
            _changing = true; 
            baidu('#stage').cssAnimate({
                translateY : -_stage.height() * newIndex
            }, 800, function() { 
                _changing = false; 
                _stage.fire('afterhide', [oldIndex]);
                _stage.fire('aftershow', [newIndex]);
            });
        });

        // 导航条位置适应
        this.on('change', function( index ) {
            var top = index == 0 ? this.height() - _nav.height() : 0;
            _nav.cssAnimate({
                "translateY" : top
            }, 800);
            baidu('body > #logo').cssAnimate({
                "translateY" : top
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
            baidu(_stage.getScreen(index).dom).addClass('activing');
        });
        this.on('aftershow', function(index) {
            fireScreenEvent(index, 'aftershow');
            baidu(_stage.getScreen(index).dom).removeClass('activing');
        });
        this.on('beforehide', function(index) {
            fireScreenEvent(index, 'beforehide');
            _stage.getScreen(index) && baidu(_stage.getScreen(index).dom).addClass('activing');
        });
        this.on('afterhide', function(index) {
            fireScreenEvent(index, 'afterhide');
            _stage.getScreen(index) && baidu(_stage.getScreen(index).dom).removeClass('activing');
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
            baidu(dom).css('top', (e.scrollTop - _stage.height() * index) * 0.618);
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

    function Splash() {
        var visible = false, 
            showDuration = 600, 
            hideDuration = 600;
            
        function show() {
            visible = true;
            baidu('#about').cssAnimate({ 
                translateY: stage.height(), 
                'box-shadow' : '0 20px 50px rgba(0,0,0,.3)' }
            , showDuration);
            baidu('#logo').cssAnimate({
                translateY: stage.height() / 2 - 10,
                translateX: 10,
                'font-size': '72px',
                color: 'white'
            }, showDuration);
        }

        function hide() {
            visible = false;
            baidu('#about').cssAnimate({ 
                translateY: stage.height(), 
                translateX: 0,
                'box-shadow' : 'none' }
            , hideDuration);
            baidu('#logo').cssAnimate({
                translateY: 0,
                'font-size': '32px',
                color: 'black'
            });
        }

        baidu('#logo').click( function() {
            visible ? hide() : show();
        });

        baidu('#about').click( function(e){
            e.stopPropagation();
            if(e.target.tagName.toLowerCase() == 'p' || e.target.tagName.toLowerCase()=='h2') return;
            hide();
        });

        var cheatCode = [38,38,40,40,37,39,37,39,65,66,65,66];
        var waiting = cheatCode.slice(0);
        baidu('body').keydown(function(e){
            if(waiting.shift()!=e.keyCode) waiting = cheatCode.slice(0);
            if(waiting.length == 0) {
                show();
                waiting = cheatCode.slice(0);
            }
        });

        this.isVisible = function() { return visible; }
    }

    var stage = new Stage();
    var splash = new Splash();

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
            setTimeout(function(){
                this.prev.cssAnimate( { 'translateX': 50 }, 200 );
                this.next.cssAnimate( { 'right': 50 }, 200 );
            }.bind(this), 100);
        })

        .on('beforehide', function(){     
            this.prev.cssAnimate( { 'translateX': -150 }, 200 );
            this.next.cssAnimate( { 'right': -150 }, 200 );
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
                    m.cssAnimate({
                        translate: s.left() + index * m.width(),
                        opacity: 1
                    }, 300);
                });
            }

            this.shower = this.fit('#member-show', 'height');
            this.slideShow = new SlideShow('#member-show');
            var _this = this, index;
            var members = this.members
                .on('mouseenter', function(e){
                    _this.find('h1').fadeOut();
                    var target = baidu(e.target);
                    index = target.prevAll().length;
                    active(index);
                });

            function active(index) {
                _this.slideShow.show(index);
                members.filter('.current').removeClass('current');
                members.eq(index).addClass('current');
            }

            this.on('navigate', function(e) {
                switch(e.direction) {
                    case 'Left':
                        if (index === undefined) index = 0;
                        index = (index + members.length - 1) % members.length;
                        return active(index);
                    case 'Right':
                        if (index === undefined) index = -1;
                        index = (index + members.length + 1) % members.length;
                        return active(index);
                }
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
            this.members.cssAnimate({opacity: 0});
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
            var mcount = 34;
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

            
            var last_cl = 0, slide_timer, dis;
            baidu(_this.dom).on('mousemove', function update(e){
                var pd = 200,
                    sw = stage.width(),
                    cw = little_container.width(),
                    pd2 = pd * sw / cw,
                    cl = (sw - cw - pd * 2) * e.x / sw + pd,
                    xp = e.x / sw;
                if(xp < 0.25 || xp > 0.75) {
                    var sign = 1;
                    if(xp > 0.5) { xp = Math.abs(xp - 1); sign = -1; }
                    xp = 0.5 - xp;
                    xp *= 8;
                    dis = sign * Math.pow(2, xp);
                    if(!slide_timer) slide_timer = setInterval(function(){
                        var ori = parseInt(little_container.css('left'));
                        if( dis > 0 && ori > pd || 
                            dis < 0 && ori < -cw + sw - pd) return;
                        little_container.css('left', ori + dis);
                    }, 20);
                } else {
                    clearInterval(slide_timer);
                    slide_timer = undefined;
                }

                // if(Math.abs(cl - last_cl) < 30) return;
                // little_container.css('left', cl);
                // last_cl = cl;
                
                moutain.css('background-position-x', -e.x * 0.8);
                
            });
            
           // baidu('#little-container').draggable();
            
            var last_timeouts = [];
            window.MEN_DELAY = [450, 400, 150];
            little_men.on('mouseenter', function(e){
                var target = baidu(e.target);
                var index = +target.attr('index');

                little_men.removeClass('stand see-left see-right');                
                dialog.fadeOut();

                target.prevAll().addClass('see-right');
                target.nextAll().addClass('see-left');

                while(last_timeouts.length) clearTimeout(last_timeouts.pop());

                last_timeouts.push(setTimeout(function(){
                    var left = target.position().left - target.width() / 2 + target.parent().position().left - 10;
                    target.addClass('stand');
                    dialog.css( { 'translateX': left });
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
    
});