/**
 * @require utility.js
 */

function Vector( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector.prototype.length = function() {
    return Math.sqrt( Vector.square( this ) );
}

extend( Vector, {
    add: function ( p, q ) {
        return new Vector( p.x + q.x, p.y + q.y );
    },
    square: function( p ) {
        return p.x * p.x + p.y * p.y;
    },
    normalize: function( p, l ) {
        if(l === undefined) l = 1;
        var factor = l / p.length();
        return new Vector( p.x * factor, p.y * factor );
    },
    verticalVector: function( p ) {
        return new Vector( p.y, -p.x );
    },
    verticalNormalize: function( p ) {
        return Vector.normalize( Vector.verticalVector(p) );
    },
    multipy: function( p, s ) {
        return new Vector( p.x * s, p.y * s );
    },
    dot: function ( p, q ) {
        return p.x * q.x + p.y * q.y;
    },
    minus: function ( p, q ) {
        return new Vector( p.x - q.x, p.y - q.y );
    },
    // p 在 q 上的投影
    projection: function( p, q ) {
        var factor = Vector.dot( p, q ) / Vector.square( q );
        return Vector.multipy( q, factor );
    }
});
