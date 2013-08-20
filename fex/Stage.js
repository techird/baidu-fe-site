
function Stage() {  
    Event.apply(this); 

    var   screens
        , disabled
        , slider
        , that
        , duration
        , hashPart;

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

    function updateHash() {
        var hash = window.location.hash.substr(1);
        hashPart = hash.split('-');
    }

    function takeControl() {
        var last_wheel_event = 0; // Mac 下一次滚动触发多个滚动事件
        // change event by wheel
        baidu( 'body' ).on( 'mousewheel', function(e) {
            if( disabled ) return;
            if ( e.timeStamp - last_wheel_event < 200 ) {
                last_wheel_event = e.timeStamp;
                return;
            }
            last_wheel_event = e.timeStamp;
            e.wheelDelta < 0 ? slider.next() : slider.prev();
        });
        window.addEventListener('hashchange', function(){
            updateHash();
            var screen = that.getScreen(hashPart[0]);
            if ( screen ) {
                slider.slide( screen.index );
            }
        });

        function navigateBy( dir, source ) {
            var stoped = false;
            var e = { direction: dir, stopPropagation: function(){ stoped = true; }, source: source };
            that.getCurrentScreen().fire( 'navigate', [e] );
            if( stoped || disabled ) return;
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
            navigateBy(e.keyIdentifier, 'keyboard');
        });

        // document.body.style.height = '1000px';
        // document.body.addEventListener( 'scroll', function(e) {
        //     if(this.scrollTop == 0) this.scrollTop = 1;
        // });
        // document.body.scrollTop = 1;

        var tsx, tsy;

        document.body.addEventListener( 'touchmove', function(e) {
            if(!disabled) e.preventDefault();
        });
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
                dy < 0 ? navigateBy('Down', 'touch') : navigateBy('Up', 'touch');
                touching = false;
            } else if ( dxl > 15 ) {
                dx < 0 ? navigateBy('Right', 'touch') : navigateBy('Left', 'touch');
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
            if(to) to.fire('aftershow', [hashPart.slice(1)]);
        });
    }

    this.start = function() {
        screens.each(function(index, screen) {
            screen.fire('init');
        });
        updateHash();
        var screen = that.getScreen( hashPart[0] );
        screen ? slider.showFirst( screen.index ) : slider.showFirst();
    }
    this.disable = function() { disabled = true; };
    this.enable = function() { disabled = false; };
    this.enabled = function() { return !disabled; };
    this.disabled = function() { return disabled; };
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
    takeControl();
}