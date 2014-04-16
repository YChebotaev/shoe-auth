var stream = require('stream'),
	inherits = require('util').inherits;

function Authenticator () {
	stream.Transform.call(this, {objectMode:true});
}

inherits(Authenticator, stream.Transform);

Authenticator.prototype.parse = function(message, encoding) {
	return message;
};

Authenticator.prototype.detect = function(message) {
	return true;
};

Authenticator.prototype.isAuthenticated = function(message) {
	return false;
};

Authenticator.prototype.authenticate = function(message, callback) {
	callback(null, message);
};

Authenticator.prototype._authenticate = function(message, callback) {
	var authenticated = this.isAuthenticated(message);
	if (!authenticated) {
		this.authenticate(message, callback);
	}
	return authenticated;
};

Authenticator.prototype.transformError = function(err, callback) {
	return callback(null, ""+err);
};

Authenticator.prototype.transformSuccess = function(result, callback) {
	return callback(null, JSON.stringify(result));
};

Authenticator.prototype._transform = function(chunk, encoding, callback) {
	var parsed, err;

	try {
		parsed = this.parse(chunk, encoding);
	} catch (e) {
		err = e;
	} finally {
		var accept, pass, skip;

		if (err != null) {
			return this.transformError(err, callback);
		} else {
			accept = this.detect(parsed);
			skip = !accept;
		}

		if (accept) {
			pass = this._authenticate(parsed, (function(err, result) {
				if (err != null) {
					return this.transformError(err, callback);
				} else {
					return this.transformSuccess(result, callback);
				}
			}).bind(this));
		}

		if (skip) {
			return callback(err);
		}

		if (pass) {
			return callback(err, chunk);
		}

	}
};

module.exports = Authenticator;