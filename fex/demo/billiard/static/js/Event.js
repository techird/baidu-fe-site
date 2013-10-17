function Event() {
    this._event = {};
    this.on = function ( name, callback ) {            
        var callbacks = this._event[name] = this._event[name] || [];
        callbacks.push(callback);
        return this;
    };
    this.fire = function( name, args ) {
        if(!this._event[name]) return;
        var that = this;
        this._event[name].forEach(function( callback ) {
            callback.apply( that, args );
        });
        return this;
    };
}