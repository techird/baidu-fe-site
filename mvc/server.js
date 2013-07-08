var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

var handlers = [];

Function.empty = function() { /* empty func */ };

function addHandler( handler ) {
    handler.name = handler.name || ( "Handler" + addHandler.NEXT = ++addHandler.NEXT || 1);
    handler.pattern = handler.pattern || /.*/;
    handler.handle = handler.handle || Function.empty;
    handlers.push( handler );
}

function route( request, response ) {
    var url = request.url;
    var handler;
    for( var i = 0; i < handlers.length; ++i ) {
        handler = handlers[i];
        if ( handler.pattern.test(url) ) break;
    }
    handler.handle( request, response );
    console.log("Request: ", url);
    console.log("Handler: ", handler.name);
    console.log();
}


var STATIC_CONTENT_TYPE = {
    'txt'  : 'text/plain',
    'html' : 'text/html',
    'css'  : 'text/css',
    'js'   : 'text/javascript',
    'jpg'  : 'image/jpg',
    'jpeg' : 'image/jpeg',
    'png'  : 'image/png',

};

var static_handler = {
    name : 'Static Handler',
    pattern: /\w+\.(\w{2,4})(?:$|\?)/,
    handle: function(request, response) {
        var ext = this.pattern.exec(request.url)[1];
        if( !ext ) return false;
        var filename = path.join( global_dirname, url.parse(request.url).pathname );
        path.exists(filename, function( exists ) {
            if(!exists) {
                response.writeHead( 404, { 'Content-Type' : 'text/plain' } );
                response.end("404 - File Not Found");
                return;
            }
            fs.readFile(filename, "binary", function( err, file ) {
                if(err) {
                    response.writeHead(500, { "Content-Type" : "text/plain" });  
                    response.end(err); 
                }
                var contentType = STATIC_CONTENT_TYPE[ext];
                if( !contentType ) {
                    response.writeHead(403, {"Content-Type" : "text"});
                    response.end('Not Allowed.');
                    return;
                }
                response.writeHead(200, {"Content-Type" : contentType });
                response.write(file, "binary");
                response.end();
            })
        });
        return true;
    }
};

var default_handler = {
    name : 'Default Handler',
    pattern : /./,
    handle: function( request, response ) {
        response.writeHead( 404, {"Content-Type" : "text/plain"} );
        response.end("404 Not Handled Request");
    }
};

exports.addHandler = addHandler;

var global_dirname;
exports.start = function( port, __dirname ) {
    global_dirname = __dirname;
    var server = http.createServer();
    server.addListener( 'request', route );
    server.listen( port || 80 );
    addHandler( static_handler );
    addHandler( default_handler );
}