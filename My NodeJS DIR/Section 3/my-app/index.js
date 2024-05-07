/*
 * Primary file for API 
 *
 */

//Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
/* string_decoder is a vast lib. we need 			^
 * a fraction of that and string_decoder			|
 * parameter contains the functions we need ---------
 */

// The server should respond to all requests with a string.
var server = http.createServer(function(req,res){
	
	// Get the URL and parse it
	var parsedUrl = url.parse(req.url,true);

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the string query as an Object
	var queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	var method = req.method.toUpperCase();

	// Get the headers as an object 
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8')		/* decoder object to decode a utf-8 to a string */
	var buffer = '';							    
	req.on('data', function(data){					/* takes the 'data', when 'data' event is emitted by the 'req' object, and plug it in a call back function */
		buffer += decoder.write(data);			    /* appending the stream of decoded 'data' to buffer "bit-by-bit"*/
	});

	// Stop the binding on the end of the stream
	req.on('end', function(){						/* This call back stops appending the string when the 'end' event of the stream is detected*/
		buffer += decoder.end();

		// Send the response
		res.end("Hello World\n");

		// Log the requested payload
	console.log('Request received with payload: '+buffer);
	});

	

	// Log the requested path
	console.log('Request received on path: '+trimmedPath+ ' with the method: '+method+ 'with these query string parameters: ', queryStringObject,' and headers ', headers);
});


// Start the server, and have it listen on port 3000.
server.listen(3000,function(){
	console.log("The Server is now listening on port 3000.");
});