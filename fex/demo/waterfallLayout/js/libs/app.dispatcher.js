/**
 * app.dispatcher.js
 * @author dron
 */

app.Dispatcher = function(){
  var handlersMapping = {};
  var Dispatcher = {};
  var slice = [].slice;

  Dispatcher.addEventListener = 
  Dispatcher.on = function( eventName, handler ){
    if( !handlersMapping[ eventName ] ){
      handlersMapping[ eventName ] = [ handler ];
    }else{
      handlersMapping[ eventName ].push( handler );
    }
  };

  Dispatcher.removeEventListener = 
  Dispatcher.off = function( eventName, handler ){
    var handlers;

    if( handlers = handlersMapping[ eventName ] ){
      for( var i = handlers.length - 1; i >= 0; i -- ){
        if( handlers[ i ] === handler )
          handlers.splice( i, 1 );
      }
    }
  };

  Dispatcher.postMessage = 
  Dispatcher.trigger = function( eventName/*, args.. */ ){
    var handlers, args, removes = [];

    if( handlers = handlersMapping[ eventName ] ){
      args = slice.call( arguments, 1 );

      handlers.forEach( function( handler, index ){
        if( handler.apply( null, args ) === Dispatcher.REMOVEME ){
          removes.push( {
            eventName: eventName,
            handler: handler
          } );
        }
      } );
    }

    for( var i = removes.length - 1; i >= 0; i -- )
      Dispatcher.removeEventListener( removes[ i ].eventName, removes[ i ].handler );
  };

  Dispatcher.REMOVEME = 0xa;
	return Dispatcher;
}();