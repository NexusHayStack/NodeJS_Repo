/*
 * Primary file for API 
 *
 */

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var config = require('./lib/config');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers')
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
/* string_decoder is a vast lib. we need 			^
 * a fraction of that and string_decoder			|
 * parameter contains the functions we need ---------
 */

// @TODO GET RID OF THIS
helpers.sendTwilioSms('7845934678','Hello!',function(err){
	console.log('this was the error',err);
});

// Instantiate the HTTP server
var httpServer = http.createServer(function(req,res){
	unifiedServer(req,res);
});


// Start the server
httpServer.listen(config.httpPort,function(){
	console.log("The Server is now listening on port " +config.httpPort+ " in " +config.envName+ " mode");
});

// Instantiate the HTTPS server
var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
	unifiedServer(req,res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort,function(){
	console.log("The Server is now listening on port " +config.httpsPort+ " in " +config.envName+ " mode");
});

// All the server logic for both the http and https createServer
var unifiedServer = function(req,res){
	
	// Get the URL and parse it
	var parsedUrl = url.parse(req.url,true);

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
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : helpers.parseJsonToObject(buffer)
		};
		
		// Route the request to the handler specified in the router
		chosenHandler(data,function(statusCode,payload){
			//Use the status code called back by the handler, or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			// Use the payload called back by the handler, or default to an empty object
			payload = typeof(payload) == 'object' ? payload : {};
			

			//Convert the payload to a string
			var payloadString = JSON.stringify(payload);

			// Send the response
				// Sending a 'Header Content' = json, telling the client browser that server is sending a json type
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the requested payload
			console.log(trimmedPath,statusCode);
		});

		
	});

	
};



// Define a request router
var router = {
	'ping' : handlers.ping,
	'users' : handlers.users,
	'tokens' : handlers.tokens,
	'checks' : handlers.checks
}