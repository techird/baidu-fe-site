Function.prototype.bind = function(context) {
    var _this = this;
    return function() {
        return _this.apply(context, arguments);
    }
}

function plan( fn, delay, args, context ) {
    var timer = setTimeout(function(){
        fn.apply(context, args);
    }, delay);
    return {
        cancel: function() { 
            clearTimeout(timer);
        }
    }
}