function Control( stage, splash ) {
    Event.apply(this);

    function getNavPosition( screenIndex ) {
        var y = 0;
        if ( screenIndex == 0 ) {
            y = stage.height() - baidu('#top-nav').height();
        }
        return y;
    }

    function fitNavPosition( screen ) {
        screen = screen || stage.getCurrentScreen();
        baidu('#top-nav, #logo').css3( { translateY: getNavPosition( screen.index ) } )
    }

    stage.on('start', fitNavPosition);

    // 导航条位置适应
    baidu(window).on( 'resize', function( ) {            
        stage.enabled() && fitNavPosition();
        stage.getCurrentScreen().fire('resize');
    });

    this.fitNavPosition = fitNavPosition;

    // 导航条位置适应
    stage.on('beforeslide', function( index_from, index_to ) {
        baidu('#top-nav, #logo').cssAnimate( { translateY: getNavPosition( index_to ) }, stage.duration );
    });

    // 更新导航当前项
    stage.on('afterslide', function( index_from, index_to ) {
        var name = stage.getScreen(index_to).name;
        baidu('#top-nav #menu ul li')
            .removeClass('current')
            .filter(function(index, dom){
                return ~this.getAttribute('screens').indexOf( name );
            })
            .addClass('current');
        var origin = window.location.hash.substr(1);
        if(origin.split('-')[0] != name)
            window.location.hash = name;
    });

    splash.on('show', stage.disable);
    splash.on('hide', stage.enable);

    var cheatCode = "BESTORNOTHING".split('');
    var waiting = cheatCode.slice(0);
    var that = this;
    baidu('body').keydown(function(e){
        if(waiting.shift() != String.fromCharCode(e.keyCode).toUpperCase()) waiting = cheatCode.slice(0);
        if(waiting.length == 0) {
            that.fire('coloregg');
            waiting = cheatCode.slice(0);
        }
    });
    console.log('Say this: ');
    console.log('%cBESTORNOTHING', 'color: green;');
    this.on('coloregg', function(){
        alert('FE\nBest or nothing\nYou are right!');
    });

    this.disableNavigation = function( duration ) {
        stage.disable();
        baidu('#top-nav, #logo').cssAnimate({opacity: 0, translateY: -100, translateX: 0}, duration || 300);
    }
    this.enableNavigation = function( duration ) {        
        if(stage.enabled()) return;
        stage.enable();
        baidu('#top-nav, #logo').cssAnimate({opacity: 1, translateY: 0}, duration || 300);
    }

    this.displayLoading = function( display ) {
        baidu('.loading').css('display', display === false ? 'none' : 'block');
    }
}