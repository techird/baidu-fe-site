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
        elem.cssAnimate({scale: scale});
    };
    var last_timer;
    baidu(window).on('resize', function(){
        clearTimeout(last_timer);
        last_timer = setTimeout(onresize, 300);
    });
    this.on('beforeshow', onresize);
    onresize();
    return elem;
}