var shoe = require('shoe'),
	http = require('http'),
	fs   = require('fs');

var httpServer = http.createServer(function(req,res) {
	fs.createReadStream(__dirname+"/index.html")
	.pipe(res);
});

var Authenticator = require('../lib/authenticator');

// var authenticator = new Authenticator();

var inherits = require('util').inherits;

function TestAuthenticator () {
	Authenticator.apply(this, arguments);
	this.tokens = [];
}

inherits(TestAuthenticator, Authenticator);

TestAuthenticator.prototype.parse = function(data) {
	return JSON.parse(data);
};

TestAuthenticator.prototype.detect = function(message) {
	if (typeof message.token == 'string' || typeof message.token == 'number') {
		return true;
	}
	if (typeof message.projectId != 'string' || !message.projectId.trim()) {
		return false;
	}
	if (typeof message.userId != 'string' || !message.userId.trim()) {
		return false;
	}
	return true;
};

TestAuthenticator.prototype.isAuthenticated = function(message) {
	console.log(message, this.tokens[message.token] ? 'is authenticated' : 'is not authenticated');
	return this.tokens[message.token];
};

TestAuthenticator.prototype.authenticate = function(message, callback) {
	if (message.token) {
		return callback(new Error('Token invalid'));
	} else {
		var token = Date.now();
		this.tokens[token] = true;
		return callback(null, {
			token: token
		});
	}
};

var authenticator = new TestAuthenticator;

var ws = shoe(function(stream) {
	stream
	.pipe(authenticator)
	.pipe(stream);
});

ws.install(httpServer, '/ws');

httpServer.listen(8080);