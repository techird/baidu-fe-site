function Set() {
    this.length = 0;
    this.has = function( elem ) {
        for(var i = 0; i < this.length; i++) {
            if( elem == this[i] ) return true;
        }
    }
    this.add = function( elem ) {
        if(!this.has( elem )) {            
            this[this.length++] = elem;
        }
    }
    this.remove = function( elem ) {
        for(var i = 0; i < this.length; i++) {
            if( this[i] == elem ) {
                for(var j = i; j < this.length - 1; j++) {
                    this[j] = this[j + 1];
                }
                return delete this[--this.length];
            }
        }
    }
}
