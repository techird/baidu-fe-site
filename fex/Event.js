function Event() {
    this._event = {};
    this.on = function ( name, callback ) {            
        var callbacks = this._event[name] = this._event[name] || baidu.Callbacks();
        callbacks.add(callback);
        return this;
    };
    this.off = function( name, callback ) {                 
        var callbacks = this._event[name] = this._event[name] || baidu.Callbacks();
        callbacks.remove(callback);
        return this;
    }
    this.fire = function( name, args ) {
        if(!this._event[name]) return;
        //console.log(this, name, args);
        this._event[name].fireWith( this, args );
        return this;
    };
}