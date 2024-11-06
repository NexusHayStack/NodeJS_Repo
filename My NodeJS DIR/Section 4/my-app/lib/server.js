/*
 * Server-related tasks 
 *
 */

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var config = require('./config');
var handlers = require('./handlers');
var helpers = require('./helpers')
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
/* string_decoder is a vast lib. we need 			^
 * a fraction of that and string_decoder			|
 * parameter contains the functions we need ---------
 */
var path = require('path');
var util = require('util');
var debug = util.debuglog('server');

// Instantiate the server module object
var server = {};


// Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
	server.unifiedServer(req,res);
});


// Instantiate the HTTPS server
server.httpsServerOptions = {
	'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
	'cert' : fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
	server.unifiedServer(req,res);
});


// All the server logic for both the http and https createServer
server.unifiedServer = function(req,res){
	
	// Get the URL and parse it
	var parsedUrl = url.parse(req.url,true);	/* The 'true' value tells the parse function to also add 'query' and return 'parsedUrl.query' as a queryString Object */

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the string query as an Object
	var queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	var method = req.method.toLowerCase();

	// Get the headers as an object 
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8')		/* decoder object to decode a utf-8 to a string */
	var buffer = '';							    
	req.on('data', function(data){					/* takes the 'data', when 'data' event is emitted by the 'req' object, and plug it in a call back function */
		buffer += decoder.write(data);			    /* appending the stream of decoded 'data' to buffer "bit-by-bit"*/
	});
	
	// Stop the binding on the end of the stream
	req.on('end', function(){						/* This function stops appending the string when the 'end' event of the stream is detected, i.e. it will be executed weather there is a payload or not*/
		buffer += decoder.end();

		// Choose the handler this request should go to. If one is not found, use the notFound handler.
		var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : helpers.parseJsonToObject(buffer)
		};
		
		// Route the request to the handler specified in the router
		chosenHandler(data,function(statusCode,payload,contentType){

			// Determine the type of response (fallback to JSON)
			contentType = typeof(contentType) == 'string' ? contentType : 'json';

			//Use the status code called back by the handler, or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			
			// Send the response-parts that are content-specific
			if(contentType == 'json'){
				res.setHeader('Content-Type','application/json');
				// Use the payload called back by the handler, or default to an empty object
				payload = typeof(payload) == 'object' ? payload : {};
				payloadString = JSON.stringify(payload);
			}
			if(contentType == 'html'){
				res.setHeader('Content-Type','text/html');
				payloadString = typeof(payload) == 'string' ? payload : '';
			}

			// Send the response-parts that are common to all content-types
				// Sending a 'Header Content' = json, telling the client browser that server is sending a json type
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the requested payload
			debug(trimmedPath,statusCode);

			// Log the requested path
			// If the response is 200, print green otherwise print red
			if(statusCode == 200){
				debug('\x1b[32m%s\x1b[0m','Returning this response: '+method.toUpperCase()+' /'+trimmedPath+' '+statusCode,payloadString);
			} else {
				debug('\x1b[31m%s\x1b[0m','Returning this response: '+method.toUpperCase()+' /'+trimmedPath+' '+statusCode,payloadString);
			}
			
		});

		
	});

	
};



// Define a request router
server.router = {
	'' : handlers.index,
	'account/create' : handlers.accountCreate,
	'account/edit' : handlers.accountEdit,
	'account/deleted' : handlers.accountDeleted,
	'session/create' : handlers.sessionCreate,
	'session/deleted' : handlers.sessionDeleted,
	'checks/all' : handlers.checkList,
	'checks/create' : handlers.checksCreate,
	'checks/edit' : handlers.checksEdit,
	'ping' : handlers.ping,
	'api/users' : handlers.users,
	'api/tokens' : handlers.tokens,
	'api/checks' : handlers.checks
}

// Init script
server.init = function(){
	// Start the HTTP server
	server.httpServer.listen(config.httpPort,function(){
		console.log('\x1b[36m%s\x1b[0m',"The Server is now listening on port " +config.httpPort+ " in " +config.envName+ " mode");
	});

	// Start the HTTPS server
	server.httpsServer.listen(config.httpsPort,function(){
		console.log('\x1b[35m%s\x1b[0m',"The Server is now listening on port " +config.httpsPort+ " in " +config.envName+ " mode");
	});

};


module.exports = server;