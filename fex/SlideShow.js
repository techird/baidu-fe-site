/**
 * var baidu = require('tangram.js');
 * var CSS3Animate = require('CSS3Animate.js');
 */

/**
 * @class  SlideShow
 * @author techird
 *
 * @description 使用css3动画实现的slider，包含 fold、fade 效果
 * 
 * @example
 *      var slideShow = new SlideShow(config);
 *      slideShow.slide(0);
 *      slideShow.next();
 * }
 *
 * @oaran {string} selector 父容器，子元素将作为滑动元素
 * @param {string} direction 滑动方向，取值 "x" 或 "y"
 * @param {string|number} duration 动画的时长
 * @param {string|object|array} [effect] opt, 使用的效果，可以是 "fold"、"fade"、['fold', 'fade']、{ fold: { ratio: 0.5 } }
 * 
 * @method slide(index)
 * @method next()
 * @method prev()
 * @method index()
 * @method hasNext()
 * @method hasPrev()
 * 
 * @event beforeslide(from, to)
 * @event afterslide(from, to)
 */

var SlideShow = (function( baidu, CSS3Animate ){

function Event() {
    this._event = {};
    this.on = function ( name, callback ) {            
        var callbacks = this._event[name] = this._event[name] || baidu.Callbacks();
        callbacks.add(callback);
        return this;
    };
    this.off = function( name, callback ) {
        var callbacks = this._event[name];
        if( !callbacks ) return;
        callbacks.remove( callback );
    }
    this.fire = function( name, args ) {
        if(!this._event[name]) return;
        this._event[name].fireWith( this, args );
        return this;
    };
}

function merge( target, source ) {
    if(!source) return target;
    for(var p in source)
        if ( source.hasOwnProperty(p) ) target[p] = source[p];
    return target;
}

function SlideShow( config ) {
    Event.apply(this);

    // config
    var container
      , direction
      , revert
      , duration
      , effect
      , allowFold
      , showDelay
      , foldDelay;

    // vars
    var index
      , sliding
      , sliders
      , foldTimer;

    // save this
    var that = this;

    function fire() {
        that.fire.apply(that, arguments);
    }

    loadConfig(config);
    initVars();

    function loadConfig( config ) {
        if ( typeof(config) == 'string' ) {
            config = {
                container: config
            }
        }
        config = merge( {
            direction: 'x',
            duration: 300,
            allowFold: false
        }, config );

        container = baidu.dom( config.container );

        switch( config.direction.toLowerCase() ) {
            case '-x':
                revert = true;
            case 'x':
                direction = 'X';
                break;
            case '-y':
                revert = true;
            case 'y':
                direction = 'Y';
                break;
            default:
                direction = 'X';
        }
        duration = config.duration;
        showDelay = config.showDelay;
        allowFold = config.allowFold;
        foldDelay = config.foldDelay;
        effect = {};
        switch( Object.prototype.toString.call(config.effect) ) {
            case '[object Array]':
                for (var i = config.effect.length - 1; i >= 0; i--) {
                    if( config.effect[i] == 'fold' ) {
                        effect['fold'] = { ratio : 1 - 0.618 };
                    }
                    if( config.effect[i] == 'fade' ) {
                        effect['fade'] = true;
                    }
                }
                break;
            case '[object String]':
                if(config.effect == 'fold') effect['fold'] = { ratio : 1 - 0.618 };
                if(config.effect == 'fade') effect['fade'] = true;
                break;
            case '[object Object]':
                effect = config.effect;
                break;
        }
    }

    function initVars() {
        sliding = false;
        sliders = container.children().css('display', 'none');
    }

    function showFirst( first_index ) {
        index = first_index || 0;
        fire('beforeslide', [undefined, index]);
        sliders.eq(index).css('display', 'block');
        fire('afterslide', [undefined, index]);
    }

    function getState( name, dir ) {
        var offset = direction == 'X' ? container.width() : container.height();
        var translate = 'translate' + direction;
        var state = {};
        var ratioNext = effect.fold && effect.fold.ratio || 1;
        var ratioPrev = effect.fold && effect.fold.both ? ratioNext : 1;
        dir = revert ? -dir : dir;
        switch(name) {
            case 'hide':
                state[translate] = dir > 0 ? -offset * ratioNext : offset * ratioPrev;
                if( effect.fade ) state['opacity'] = 0;
                return state;
            case 'afterhide':
                state['display'] = 'none';
                return state;
            case 'beforeshow':
                state['display'] = 'block';
                state[translate] = dir > 0 ? offset * ratioPrev : -offset * ratioNext;
                if( effect.fade ) state['opacity'] = 0;
                return state;
            case 'show':
                state[translate] = 0;
                if( effect.fade ) state['opacity'] = 1;
                return state;
        }
    }

    function slide (index_to) {
        if( sliding && !allowFold ) return;
        if( index_to == index ) return;
        if( allowFold ) {
            clearTimeout( foldTimer );
            foldTimer = setTimeout( function(){
                doSlide(index_to);
            }, foldDelay);
            return;
        }
        doSlide( index_to );   
    }

    function doSlide(index_to) {
        sliding = true;
        var e = [index, index_to];
        fire('beforeslide', e);

        var dir = index_to > index ? 1 : -1,
            from = index !== undefined && sliders.eq(index),
            to = index_to !== undefined && sliders.eq(index_to);

        if ( from ) {
            var old_index = index;
            from.cssAnimate( getState('hide', dir), duration, function(){
                if(index != old_index) from.css3( getState('afterhide') );
            });
        }
        if ( to ) {
            to.css3( getState('beforeshow', dir) );
            setTimeout(function(){                
                to.cssAnimate( getState('show'), duration, function(){
                    fire('afterslide', e);
                    sliding = false;
                });
            }, showDelay || 10);
        }     
        index = index_to;
    }

    this.slide = slide;
    this.index = function() {
        return index;
    }
    this.next = function() {
        if ( this.hasNext() ) slide(index + 1);
    };
    this.prev = function() {
        if ( this.hasPrev() ) slide(index - 1);
    };
    this.hasNext = function() {
        return index < sliders.length - 1;
    }
    this.hasPrev = function() {
        return index > 0;
    }
    this.showFirst = showFirst;
}

return SlideShow;

})(baidu, CSS3Animate);

