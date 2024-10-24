/*
 * Worker-related tasks
 *
 *
 *
 */

// Dependencies
var path =require('path');
var fs = require('fs');
var _data = require('./data');
var https = require('https');
var http = require('http');
var helpers = require('./helpers');
var url = require('url');
var _logs = require('./logs');
var util = require('util');
var debug = util.debuglog('workers');

// Instantiate the worker object
var workers = {};


// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = function(){
	console.log('Calling all Checks...')
	// Get all the checks that exist in the system
	_data.list('checks',function(err,checks){
		if(!err && checks && checks.length > 0){
			checks.forEach(function(check){
				// Read in the check data
				_data.read('checks',check,function(err,originalCheckData){
					if(!err && originalCheckData){
						// Pass it to the check validator, and let that function to continue or log errors as needed
						workers.validateCheckData(originalCheckData);
					} else {
						debug("Error reading one of the check's data");
					}
				});
			});
		} else {
			// There is no requester for the gatherAllChecks but it is just a background worker requiring no callback
			// So we are just going to log it out on the terminal.
			debug("Error: Could not find any checks to process")
		}
	});
};

// Sanity-check the check-data
workers.validateCheckData = function(originalCheckData){
	originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
	originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
	originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
	originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
	originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
	originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
	originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
	originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;
	/**IMPORTANT* If a variable, say 'id' is a string it's length is given by 'id.trim().length' 
	 * and if it is of an object type, say 'childrenInMyBasement' also of which is an instance of 'Array' object 
	 * the length/size (number of elements in the array) is given by 'childrenInMyBasement.length'*/

	// Set the keys that may not be set (if the workers have never seen this check before)
	originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
	originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

	// If all the checks pass, pass the data along to the next step in the process
	if(originalCheckData.id &&
	originalCheckData.userPhone &&
	originalCheckData.protocol &&
	originalCheckData.url &&
	originalCheckData.method &&
	originalCheckData.successCodes &&
	originalCheckData.timeoutSeconds){
		workers.performCheck(originalCheckData);
	} else {
		debug("Error: One of the checks is not properly formatted. Skipping it.")
	}
};

// Perform the check, send the originalCheckData and the outcome of the check process, to the next step in the process.
workers.performCheck = function(originalCheckData){
	// Prepare the initial check outcome
	var checkOutcome = {
		'error' : false,
		'responseCode' : false
	};
	// Mark that the outcome has not been sent yet
	var outcomeSent = false;

	// Parse the hostname and the path out of the original check data
	var parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url,true);
	var hostName = parsedUrl.hostname;
	var path = parsedUrl.path; // Using path and not "pathname" because we want the query string

	// Construct the request
	var requestDetails = {
		'protocol' : originalCheckData.protocol+':',
		'hostname' : hostName,
		'method' : originalCheckData.method.toUpperCase(),
		'path' : path,
		'timeout' : originalCheckData.timeoutSeconds * 1000
	};
	// Instantiate the request object (using either the http or https module)
	var _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
	

	var req = _moduleToUse.request(requestDetails,function(res){
		// Grab the status of the sent request (😁👂?) //
		var status = res.statusCode;
		// Update the checkOutcome and pass the data along
		checkOutcome.responseCode = status;
		if(!outcomeSent){
			workers.processCheckOutcome(originalCheckData,checkOutcome);
			outcomeSent = true;
		}
	});

	// Bind to the error event so it doesn't get thrown
	req.on('error',function(e){
		// Update the checkOutcome and pass the data along
		checkOutcome.error = {
			'error' : true,
			'value' : e
		};
		if(!outcomeSent){
			workers.processCheckOutcome(originalCheckData,checkOutcome);
			outcomeSent = true;
		}
	});

	// Bind to the timeout event
	req.on('timeout',function(e){
		// Update the checkOutcome and pass the data along
		checkOutcome.error = {
			'error' : true,
			'value' : 'timeout'
		};
		if(!outcomeSent){
			workers.processCheckOutcome(originalCheckData,checkOutcome);
			outcomeSent = true;
		}
	});

	// End the request
	req.end();

};

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)

workers.processCheckOutcome = function(originalCheckData,checkOutcome){
	// Decide if the check is considered up or down
	var state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
	// Decide if an alert is wanted
	var alertWanted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

	//Log the outcome
	var timeOfCheck = Date.now();
	workers.log(originalCheckData,checkOutcome,state,alertWanted,timeOfCheck);

	//Update the check data
	var newCheckData = originalCheckData;
	newCheckData.state = state;
	newCheckData.lastChecked = timeOfCheck;

	// Mask the phone number and send it to the error message
	var phoneNumber = newCheckData.userPhone;
	var maskedPhoneNumber = phoneNumber.slice(0, -4).padEnd(phoneNumber.length, '*');

	// Save the updates
	_data.update('checks',newCheckData.id,newCheckData,function(err){
		if(!err){
			// Send the new check data to the next phase in the process if needed
			if(alertWanted){
				workers.alertUserToStatusChange(newCheckData);
			} else{
				debug('Check outcome has not changed, no alert needed');
			}

		} else {
			debug('Error trying to save update of one of the checks ${'+newCheckData.id+'} for the user ${'+maskedPhoneNumber+'}');
		}
	});
	
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = function(newCheckData){
	var msg = 'Alert: The check for '+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;

	// Mask the phone number and send it to the error message
	var phoneNumber = newCheckData.userPhone;
	var maskedPhoneNumber = phoneNumber.slice(0, -4).padEnd(phoneNumber.length, '*');

	helpers.sendTwilioSms(newCheckData.userPhone,msg,function(err){
		if(!err){
			debug("Success: User was alerted of the change in their check, via an SMS:\n",msg)
		} else{
			debug('Error sending SMS to the user ${'+maskedPhoneNumber+'} with state change in their check ${'+newCheckData.id+'}')
		}
	});
};

workers.log = function(originalCheckData,checkOutcome,state,alertWanted,timeOfCheck){
	//From the log data 
	var logData = {
		'check' : originalCheckData,
		'outcome' : checkOutcome,
		'state' : state,
		'alert' : alertWanted,
		'time' : timeOfCheck
	};

	// Convert data to a string 
	var logString = JSON.stringify(logData);

	// Determine the name of the log file
	var logFileName = originalCheckData.id;

	//Append the log string to the file
	_logs.append(logFileName,logString,function(err){
		if(!err){
			debug('Logging to file succeeded');
		} else {
			debug('Logging to file failed');
		}
	});
};

// Timer to execute the worker-process once per minute
workers.loop = function(){
	setInterval(function(){
		// User set's a check, and we will execute it once per minute, So all the checks need to be gathered in a minute and perform them.
		workers.gatherAllChecks();
	},1000 * 60)
};

// Rotate (compress) the log files 
workers.rotateLogs = function(){
	// Listing all the (non-compressed) log files
	_logs.list(false,function(err,logs){			// 'false' parameter gives a boolean value to the function for: "weather to include compressed folders into the list?" 
		if(!err && logs && logs.length > 0){
			logs.forEach(function(logName){
				// Compress the data to a different file
				var logId = logName.replace('.log','');
				var newFileId = logId+'-'+Date.now();
				_logs.compress(logId,newFileId,function(err){
					if(!err){
						// Truncate the log
						_logs.truncate(logId,function(err){
							if(!err){
								debug("Success truncating logFile");
							} else {
								debug("Error truncating logFile");
							}
						});
					} else {
						debug("Error compressing one of the log files",err);
					}
				});
			});
		} else {
			debug("Error: Could not find any logs to rotate");
		}
	});
};

// Timer to execute the log-rotation process once per day
workers.logsRotationLoop = function(){
		setInterval(function(){
		// We will execute it once per day, So all the logs of a day are compressed to save space.
		workers.rotateLogs();
	},1000 * 60*60*24)
};


// Init script
workers.init = function(){

	console.log('Initializing...');
	// Send to console, in green
	console.log('\x1b[32m%s\x1b[0m','Background workers are now running');
	
	// Exectute all the checks immediately
	workers.gatherAllChecks();

	// Call the loop so the checks will execute later on
	workers.loop();

	// Compress all the logs imediately
	workers.rotateLogs();

	// Call the compression loop so logs will be compressed	later on
	workers.logsRotationLoop();
}





// Export the module
module.exports = workers;