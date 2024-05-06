/*
 * Primary file for API 
 *
 */

//Dependencies
var http = require('http');
var url = require('url');

// The server should respond to all requests with a string.
var server = http.createServer(function(req,res){
	
	// Get the URL and parse it
	var parsedUrl = url.parse(req.url,true);

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the HTTP Method
	var method = req.method.toUpperCase();

	// Send the response
	res.end("Hello World\n");

	// Log the requested path
	console.log('Request received on path: '+trimmedPath+ 'with the method: '+method);
});


// Start the server, and have it listen on port 3000.
server.listen(3000,function(){
	console.log("The Server is now listening on port 3000.");
});