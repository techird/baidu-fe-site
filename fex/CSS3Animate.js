var CSS3Animate = (function (window) {
    var ua = /Chrome|Firefox|IE|Safari|Opera/.exec(window.navigator.userAgent);
    var perfix = {
        'Chrome' : '-webkit-',
        'Safari' : '-webkit-',
        'Firefox' : '-moz-',
        'IE' : '-ms-',
        'Opera' : '-o-' }[ua] || '';

    function decodeTransform( str ) {
        var transform = {
            translate: [0,0,0],
            rotate: [0,0,0],
            scale: [1,1,1],
            skew: [0,0],
            perspective: 0
        };
        if(!str) return transform;
        var match, patten, i;

        patten = /(translate|rotate|scale|skew|perspective)(3d|X|Y|Z)?\(\s*?([0-9pxdeg\.%]+?)\s*?(?:,\s*?([0-9pxdeg\.%]+?))?(?:,\s*?([0-9pxdeg\.%]+?))?\s*?\)/gi;
        while(match = patten.exec(str)) {
            switch(match[2]) {
                case '3d': 
                    transform[match[1]] = removeUnit(match.slice(3));
                    break;
                case 'X':
                    transform[match[1]][0] = parseInt(match[3]);
                    break;
                case 'Y':
                    transform[match[1]][1] = parseInt(match[3]);
                    break;
                case 'Z':
                    transform[match[1]][2] = parseInt(match[3]);
                    break;
                default:
                    transform[match[1]] = match.length > 4 ? removeUnit(match.slice(3)) : parseInt(match[3]);

            }
        }
        return transform;
    }

    function removeUnit( arr ) {
        for( var i = 0; i < arr.length; i++ )
            if ( arr[i] ) arr[i] = parseInt(arr[i]);
        return arr;
    }

    function addUnit( arr, unit ) {
        for( var i = 0; i < arr.length; i++ )
            if( arr[i] ) arr[i] += unit;
        return arr;
    }

    function encodeTransform( transform ) {
        var parts = [];
        var alixs  = ['X', 'Y', 'Z'], i;
        var t = transform.translate,
            r = transform.rotate,
            s = transform.scale,
            k = transform.skew,
            p = transform.perspective;

        addUnit(t, 'px');
        addUnit(r, 'deg');
        addUnit(k, 'px');
        addUnit(p, 'px');
        for(i = 0; i < alixs.length; i++) {
            t[i] && parts.push('translate' + alixs[i] + '(' + t[i] + ')');
            // i == 2 && !t[i] && parts.push('translateZ(0)'); // gpu speed up
            r[i] && parts.push('rotate' + alixs[i] + '(' + r[i] + ')');
            k[i] && parts.push('skew' + alixs[i] + '(' + k[i] + ')');
            s[i] !== undefined && s[i] !== 1 && parts.push('scale' + alixs[i] + '(' + s[i] + ')');
        }
        if( s instanceof Array == false ) {
            parts.push('scale(' + s + ')');
        }
        if( p ) {
            parts.push('perspective(' + p + ')');
        }
        return parts.join(' ');
    }

    function mapStyles( dom, styles ) {
        var transform = decodeTransform( dom.style.getPropertyValue( perfix + 'transform' ) );
        var names = ['translate', 'rotate', 'scale', 'skew', 'perspective'],
            alixs  = ['X', 'Y', 'Z'];
        var i, j, name;
        for(i = 0; i < names.length; i++) {
            name = names[i];

            if(styles[name] !== undefined) {
                transform[name] = styles[name];
                delete styles[name];
            } 

            else {
                for(j = 0; j < alixs.length; j++) {
                    if( styles[name + alixs[j]] !== undefined ) {
                        transform[name][j] = styles[name + alixs[j]];
                        delete styles[name + alixs[j]];
                    }
                }
            }
        }
        styles[perfix + 'transform'] = encodeTransform(transform);
    }

    function setStyles( dom, styles ) {
        for( var name in styles ) {
            dom.style[name] = styles[name];
        }
    }

    function setTransition( dom, styles, duration, ease, delay ) {
        duration = duration || '300ms';
        styles = styles || 'all';
        ease = ease || 'ease';
        delay = delay || 0;
        dom.style[perfix + 'transition'] = [styles, duration, delay, ease].join(' ');
    }

    function removeTransition( dom ) {
        dom.style.removeProperty( perfix + 'transition' );
    }

    function classMotify( dom, rules ) {
        var i, sign, rule;
        rules = rules.split(' ');
        for(i = 0; i < rules.length; i++) {
            rule = rules[i];
            sign = rule.charAt(0);
            switch (sign) {
                case '-':
                    dom.classList.remove(rule.substr(1));
                    break;
                case '+':
                    dom.classList.add(rule.substr(1));
                    break;
                default:
                    dom.classList.add(rule);
            }
        }
    }

    function clone( obj ) {
        if(typeof(obj) == 'string') {
            return obj;
        }
        var copy = {};
        for(var p in obj)
            if( obj.hasOwnProperty(p) ) copy[p] = obj[p];
        return copy;
    }

    function doAnimate( dom, styles, duration, callback ) {
        styles = clone(styles);

        dom.queue = dom.queue || [];
        dom.queue.push( [doAnimate, [dom, styles, duration, callback ]] );
        if(dom.queue.length > 1) return;

        if(typeof(duration) == 'function') {
            callback = duration;
            duration = 300;
        }
        duration = duration || 300;
        setTransition( dom, 'all', duration + 'ms');
        if ( typeof(styles) == 'string' ) {
            classMotify( dom, styles );
        }
        else {
            mapStyles( dom, styles );
            setStyles( dom, styles );
        }

        dom.next_id = setTimeout( function() {
            typeof(callback) == 'function' && callback.apply(dom);
            dom.queue.shift();
            if(!dom.queue.length)
                removeTransition( dom );
            else {
                var next = dom.queue.shift();
                next[0].apply(next[0][0], next[1]);
            }
        }, duration);
    }

    HTMLElement.prototype.animate = function(styles, duration, callback) {
        doAnimate(this, styles, duration, callback);
        return this;
    }
    HTMLElement.prototype.stop = function() {
        if(!this.queue) return this;
        clearTimeout(this.next_id);
        if(!this.queue || !this.queue.length) return this;
        var last = this.queue.pop();
        var styles = last[0];
        removeTransition( this );
        mapStyles( this, styles );
        setStyles( this, styles );
        this.queue = [];
        return this;
    }
    HTMLElement.prototype.delay = function( time ) {
        this.queue = this.queue || [];
        this.queue.push([function( dom, time ){
            dom.queue.shift();
            if(dom.queue.length) dom.next_id = setTimeout( function(){                
                var next = dom.queue.shift();
                next[0].apply(next[1][0], next[1]);
            }, time);
        }, [this, time]]);
    }
    var extend = {
        cssAnimate: function ( styles, duration, callback ) {
            var length = this.length, called = 0, that = this;
            function checkCall() {
                if( ++called == length ) callback.apply( that );
            }
            for(var i = 0; i < length; i++) {
                var dom = this[i];
                doAnimate( dom, styles, duration, callback ? checkCall : undefined );
            }
            return this;
        },
        stop: function() {
            for(var i = 0; i < length; i++) {
                var dom = this[i];
                dom.stop();
            }
            return this;
        }
    };
    if ( window.baidu ) {
        window.baidu.dom.extend( extend );
        baidu.dom.extend({
            css3: function ( styles ) {
                for(var i = 0; i < this.length; ++i) {
                    var copy = clone(styles);
                    this[i].stop();
                    mapStyles(this[i], copy);
                    setStyles(this[i], copy);
                }
                return this;
            }
        });
    }

})(window);