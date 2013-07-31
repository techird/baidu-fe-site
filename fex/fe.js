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
}

function Screen( index, stage, dom ) {
    Event.apply(this);
    this.index = index;
    this.name = dom.id;
    this.stage = stage;
    this.dom = dom;
    this.$ = baidu(this.dom);
}
Screen.prototype.fit = function( selector, type ) {
    var elem = this.$.find(selector);
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
        elem.cssAnimate({
            scale: scale,
        });
    };
    this.on('resize', onresize);
    this.on('beforeshow', onresize);
    onresize();
    return elem;
}
function Stage() {  
    Event.apply(this); 

    var   screens
        , disabled
        , slider
        , that
        , duration;

    screens = baidu('.screen').map( function ( index, dom ) {
                return new Screen( index, this, dom );
            }.bind(this));
    disabled = false;
    duration = 1000;
    slider = new SlideShow({
        container: '#stage',
        direction: 'Y',
        duration: duration,
        effect: 'fold'
    });
    that = this;

    takeControl();
    function takeControl() {
        // change event by wheel
        baidu( 'body' ).on( 'mousewheel', function(e) {
            if( disabled ) return;
            e.wheelDelta < 0 ? slider.next() : slider.prev();
        });

        // change event by nav
        baidu('#top-nav #menu ul li').click(function(e){
            if( disabled ) return;
            var name = baidu(e.target).attr('screens').split(' ')[0];
            slider.slide( that.getScreen(name).index );
        });

        function navigateBy( dir ) {
            if( disabled ) return;
            var stoped = false;
            var e = { direction: dir, stopPropagation: function(){ stoped = true; } };
            that.getCurrentScreen().fire( 'navigate', [e] );
            if( stoped ) return;
            switch(dir) {
                case "Up":
                    slider.prev();
                    break;
                case "Down":
                    slider.next();
                    break;
            }
        }

        // keyboard navigate
        baidu( 'body' ).on( 'keydown', function(e) {
            navigateBy(e.keyIdentifier);
        });

        var tsx, tsy;
        document.body.addEventListener( 'touchstart', function(e) {
            if (e.touches.length !== 1 ) return;
            tsx = e.touches[0].pageX;
            tsy = e.touches[0].pageY;
        });
        document.body.addEventListener( 'touchend', function(e) {
            if (e.changedTouches.length !== 1 ) return;
            var dx = e.changedTouches[0].pageX - tsx, dy = e.changedTouches[0].pageY - tsy
                dxl = Math.abs(dx), dyl = Math.abs(dy);
            if ( dyl > dxl && dyl > 15 ) {
                dy < 0 ? navigateBy('Down') : navigateBy('Up');
                touching = false;
            } else if ( dxl > 15 ) {
                dx < 0 ? navigateBy('Right') : navigateBy('Left');
                touching = false;
            }
        });

        slider.on('beforeslide', function(from, to) {
            that.fire('beforeslide', [from, to])
            from = that.getScreen(from);
            to = that.getScreen(to);
            if(from) from.fire('beforehide');
            if(to) to.fire('beforeshow');
        });

        slider.on('afterslide', function(from, to) {
            that.fire('afterslide', [from, to])
            from = that.getScreen(from);
            to = that.getScreen(to);
            if(from) from.fire('afterhide');
            if(to) to.fire('aftershow');
        });
    }

    this.start = function() {
        screens.each(function(index, screen) {
            screen.fire('init');
        });
        slider.showFirst();
    }
    this.disable = function() { disabled = true; };
    this.enable = function() { disabled = false; };
    this.width = function() { return document.documentElement.clientWidth; };
    this.height = function() { return document.documentElement.clientHeight; };
    this.getIndex = function() { return slider.index(); };
    this.getScreen = function ( id ) { 
        if ( typeof(id) == 'number' ) return screens[id];
        for (var i = screens.length - 1; i >= 0; i--) {
            if( screens[i].name == id ) return screens[i];
        };
    };
    this.getCurrentScreen = function() {
        return this.getScreen(slider.index());
    };
    this.slideToScreen = function( id ) { return slider.slide(that.getScreen(id).index); };
    this.duration = duration;
}
function Splash( stage ) {
    Event.apply(this);
    var showDuration = 1600, 
        hideDuration = 1600,
        visible = false,
        that = this;
        
    function show() {
        visible = true;
        baidu('#about').cssAnimate({ 
            translateY: stage.height(), 
            'box-shadow' : '0 20px 50px rgba(0,0,0,.3)' }
        , showDuration);

        baidu('#logo').cssAnimate({
            'translateY': stage.height() / 2 - 70,
            'translateX': 10,
            'font-size': '72px',
            'color': 'white'
        }, showDuration);
        that.fire('show');
    }

    function hide() {
        visible = false;
        baidu('#about').cssAnimate({ 
            'translateY': 0, 
            'box-shadow' : 'none' }
        , hideDuration);

        baidu('#logo').cssAnimate({
            'translateY': stage.getCurrentScreen().index == 0 ? stage.height() - baidu('#top-nav').height() : 0,
            'translateX': 0,
            'font-size': '32px',
            'color': 'black'
        }, hideDuration);
        that.fire('hide');
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
}

function Control( stage, splash ) {
    function getNavPosition( screenIndex ) {
        var y = 0;
        if ( screenIndex == 0 ) {
            y = stage.height() - baidu('#top-nav').height();
        }
        return y;
    }

    function fitNavPosition() {
        baidu('#top-nav, #logo').css3( { translateY: getNavPosition( stage.getCurrentScreen().index ) } )
    }

    // 导航条位置适应
    baidu(window).on( 'resize', function( ) {            
        fitNavPosition();
        stage.getCurrentScreen().fire('resize');
    });

    fitNavPosition();

    // 导航条位置适应
    stage.on('beforeslide', function( index_from, index_to ) {
        baidu('#top-nav, #logo').cssAnimate( { translateY: getNavPosition( index_to ) }, stage.duration );
    });

    // 更新导航当前项
    stage.on('afterslide', function( index_from, index_to ) {
        baidu('#top-nav #menu ul li')
            .removeClass('current')
            .filter(function(index, dom){
                return ~this.getAttribute('screens').indexOf( stage.getScreen(index_to).name );
            })
            .addClass('current');
    });

    splash.on('show', stage.disable);
    splash.on('hide', stage.enable);
}

baidu(function(){       

    var stage = new Stage();
    var splash = new Splash( stage );
    var control = new Control(stage, splash);

    stage.getScreen('home')

        .on( 'init', function(){
            var screen = this;
            this.down = this.$.find('.nav.down').click(function(){
                stage.slideToScreen(1);
            });
        })

        .on('beforehide', function(){            
            this.down.cssAnimate( { 'translateY': 100 } );
        })

        .on('aftershow', function(){            
            this.down.cssAnimate( { 'translateY': -100 } );
        });

    stage.getScreen('topic')
        .on( 'init', function(){
            this.$.find('p').click(function(e){
                var index = +baidu(e.target).attr('product-index');
                stage.getScreen('product').slideShow.slide(index);
                stage.slideToScreen('product');
            });
        })

    stage.getScreen('product')

        .on( 'init', function(){
            var prev = this.prev = this.$.find('.nav.prev'),
                next = this.next = this.$.find('.nav.next');

            var slideShow = this.slideShow = new SlideShow({
                container: '#product-container',
                duration: 800
            });
            slideShow.on('afterslide', function() {
                prev.css('visibility', this.hasPrev() ? 'visible' : 'hidden');
                next.css('visibility', this.hasNext() ? 'visible' : 'hidden');
                this.hasNext() ? next.show() : next.hide();
            });
            slideShow.showFirst();
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
            this.fit('#product-container');
        })

        .on('aftershow', function() {
            setTimeout(function(){
                this.prev.cssAnimate( '+show' , 200 );
                this.next.cssAnimate( '+show' , 200 );
            }.bind(this), 100);
        })

        .on('beforehide', function(){                 
            this.prev.cssAnimate( '-show' , 200 );
            this.next.cssAnimate( '-show' , 200 );
        });

    stage.getScreen('archive')
        .on( 'init', function(){
            this.heads = this.$.find('.archive-head');
            this.left = function() {
                return (stage.width() - this.heads.outerWidth() * this.heads.length) / 2 + 20
            }
            this.middle = function() {
                return (stage.width() - this.heads.width()) / 2;
            }
            this.layout = function() {
                var s = this;
                s.heads.each(function(index, dom){
                    var m = baidu(dom);
                    m.css({
                        left: s.left() + index * m.width(),
                        opacity: 1
                    }, 300);
                });
            }

            var ss = this.slideShow = new SlideShow({
                container : '#archive-container',
                duration: 450
            });
            var _this = this, index;
            var heads = this.heads
                .on('mouseenter', function(e){
                    _this.$.find('h1').cssAnimate({opacity: 0});
                    var target = baidu(e.target);
                    index = target.prevAll().length;
                    active(index);
                });

            function active(index) {
                _this.slideShow.slide(index);
                heads.filter('.current').removeClass('current');
                heads.eq(index).addClass('current');
            }

            this.on('navigate', function(e) {
                switch(e.direction) {
                    case 'Left':
                        ss.hasPrev() ? active(ss.index() - 1) : active(heads.length - 1);
                        break;
                    case 'Right':
                        ss.hasNext() ? active(ss.index() + 1) : active(0);
                        break;
                }
            });

            this.fit('#archive-container');
        })
        .on('resize', function(width){
            this.layout();
        })
        .on('beforeshow', function(){
            this.heads.css( { 'left': this.middle() } );
            this.layout();
        })
        .on('beforehide', function(){
            this.heads.cssAnimate({opacity: 0});
        })
    
    stage.getScreen('team')
        .on( 'init', function(){       
            var container = this.$.find('#team-container');
            var drawing = this.$.find('#drawing-layer');
            var dialog = this.$.find('#dialog');
            var ly = 0, lx = 0;
            var last_index;
            var mcount = 34;     
            var _this = this;

            baidu.ajax({
                url: 'fex/member/data.json',
                dataType: 'json',
                success: init
            });

            function init( data ) {
                var seq = [], mcount = data.length;
                for(var i = 0; i < mcount; i++) seq.push(i);
                seq.sort(function(){return Math.random() > 0.5 ? 1 : -1;});

                for(var i = 0; i < mcount; i++) {
                    baidu('<div class="team-member" style="background-image: url(fex/member/' + seq[i] + '.png)" index="' + seq[i] + '"></div>').appendTo(container);
                }
                var members = _this.$.find('.team-member');
                var stand_timeout = 400, stand_timer;

                container.delegate('.team-member', 'mouseenter', function(e){
                    var target = baidu(e.target);
                    var index = +target.attr('index');

                    members.removeClass('stand see-left see-right');
                    target.prevAll().addClass('see-right');
                    target.nextAll().addClass('see-left');


                    var left = target.position().left - target.width() / 2 + target.parent().position().left - 10;


                    dialog.html('<h1>' + data[index][0] + '</h1><p>' + data[index][1] + '</p>');
                    dialog.cssAnimate( { 
                        translateX: left,
                        opacity: 1,
                        translateY: 0 
                    }, 600);

                    clearTimeout(stand_timer);
                    stand_timer = setTimeout(function(){
                        target.addClass('stand');
                    }, stand_timeout);
                });

                container.on('mouseleave', function(e){             
                    members.removeClass('stand see-left see-right');
                    dialog.cssAnimate({
                        opacity: 0,
                        translateY: -100
                    });
                    clearTimeout(stand_timer);                
                });

                var prev = _this.prev = _this.$.find('.nav.prev'),
                    next = _this.next = _this.$.find('.nav.next');

                var translateX = 0, bodyWidth = members.width();

                function goNext(){ 
                    var sw = stage.width(),
                        cw = container.outerWidth();
                    if ( translateX + sw >= cw ) return;

                    var increase = Math.min( sw - bodyWidth, cw - sw - translateX );
                    translateX += increase;
                    container.cssAnimate({ translateX: -translateX }, 1600 );
                    dialog.cssAnimate({opacity: 0, translateY: -100});

                    if ( translateX + sw >= cw ) {
                        next.hide();
                    }
                    prev.show();
                }
                function goPrev(){ 
                    var sw = stage.width(),
                        cw = container.outerWidth();
                    if ( translateX <= 0 ) return;

                    var decrease = Math.min( sw - bodyWidth, translateX );
                    translateX -= decrease;
                    container.cssAnimate({ translateX: -translateX }, 1600 );
                    dialog.cssAnimate({opacity: 0, translateY: -100});

                    if ( translateX <= 0 ) {
                        prev.hide();
                    }
                    next.show();
                }

                next.click(goNext);
                prev.click(goPrev);
                _this.on('navigate', function(e){
                    switch(e.direction) {
                        case 'Left': return goPrev();
                        case 'Right': return goNext();
                    }
                });
            }            
            
            // var ori = 0, slide_timer, dis;
            // baidu(this.dom).on('mousemove', function update(e){
            //     var pd = 200,
            //         sw = stage.width(),
            //         cw = container.width(),
            //         pd2 = pd * sw / cw,
            //         cl = (sw - cw - pd * 2) * e.x / sw + pd,
            //         xp = e.x / sw;
            //     if(xp < 0.25 || xp > 0.75) {
            //         var sign = 1;
            //         if(xp > 0.5) { xp = Math.abs(xp - 1); sign = -1; }
            //         xp = 0.5 - xp;
            //         xp *= 8;
            //         dis = sign * Math.pow(2, xp);
            //         if(!slide_timer) slide_timer = setInterval(function(){
            //             if( dis > 0 && ori > pd || 
            //                 dis < 0 && ori < -cw + sw - pd) return;
            //             container.css3( { 'translateX': ori = ori + dis});
            //         }, 20);
            //     } else {
            //         clearInterval(slide_timer);
            //         slide_timer = undefined;
            //     }
                
            //     //drawing.css('background-position-x', -e.x * 0.8); 
            // });

            
            
        })
        
        .on('aftershow', function() {
            setTimeout(function(){
                this.prev.cssAnimate( '+show' , 200 );
                this.next.cssAnimate( '+show' , 200 );
            }.bind(this), 100);
        })

        .on('beforehide', function(){                 
            this.prev.cssAnimate( '-show' , 200 );
            this.next.cssAnimate( '-show' , 200 );
        });

    stage.getScreen('contact')
        .on('init', function(){
            this.github = this.$.find('#github').addClass('hide');
        })
        .on('aftershow', function(){
            this.github.removeClass('hide');
        })
        .on('beforehide', function(){
            this.github.addClass('hide');
        })
    stage.start();
});