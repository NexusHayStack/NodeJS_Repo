/*
 *Create and export configuration variables
 *
 */

// Container for all the environments
var environments = {};

// Staging (default) environment (if user have not defined any value for NODE_ENV)
environments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging',
	'hashingSecret' : 'thisIsASecret',
	'maxChecks' : 5,
	'twilio' : {
		'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
		'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
		'fromPhone' : '+15005550006'
	},
	'templateGlobals' : {
		'appName' : 'UptimeChecker',
		'companyName' : 'NotARealCompany, Inc',
		'yearCreated' : '2024',
		'baseUrl' : 'http://localhost:3000/'
	}
};


// Production environment
environments.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production',
	'hashingSecret' : 'thisIsAlsoASecret',
	'maxChecks' : 5,
	'twilio' : {
		'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
		'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
		'fromPhone' : '+15005550006'
	},
	'templateGlobals' : {
		'appName' : 'UptimeChecker',
		'companyName' : 'NotARealCompany, Inc',
		'yearCreated' : '2024',
		'baseUrl' : 'http://localhost:5000/'
	}
};

// Detwermine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if it is not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module (only the ones that we require!!)
module.exports = environmentToExport