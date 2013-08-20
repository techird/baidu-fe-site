
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
}