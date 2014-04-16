shoe-auth
=========

Authentication stream for shoe

usage
-----
``` javascript
  var shoe = require('shoe'),
      http = require('http'),
      inherits = require('util').inherits;
  
  var BaseAuthenticator = require('shoe-auth');
  
  function MyAuthenticator () {
    BaseAuthenticator.call(this);
  }
  
  inherits(MyAuthenticator, BaseAuthenticator);
  
  MyAuthenticator.prototype.parse = function(data, encoding) {
    // Parse each incoming message
    // No need to wrap this code in try {...} catch .. block because this was already done upper on stack
    var parsed = JSON.parse(data);
    return parsed;
  };
  
  MyAuthenticator.prototype.detect = function(parsed) {
    // If this method returns false, then message will be filtered and do not appear at output of this stream
    return true;
  };
  
  MyAuthenticator.prototype.isAuthenticated = function(parsed) {
    // Should return true in case of this message was already authenticated
    // If this method returns true, then #authenticate one will not be invoked
    return false;
  };
  
  MyAuthenticator.prototype.authenticate = function(parsed, callback) {
    // Should always call callback (err, result) arguments.
    // If there were any kind of error (including wrong credentials), callback should be called with err argument
    callback(null);
  };
  
  MyAuthenticator.prototype.transformSuccess = function(result, callback) {
    // This method is called after #authenticate
    // Anything you pass as 2nd callback(err, transformedResult) arguments will be in output of this stream
    callback(null, result); // No transformation needed
  };
  
  MyAuthenticator.prototype.transformError = function(err, callback) {
    // This method is called after #authenticate and err is actually authentication (or any other) error
    // If you don't want to expose errors to client, you should call callback without argument;
    callback();
  };
  
  var authenticator = new MyAuthenticator();
  
  var ws = shoe(function(stream){
    stream
      .pipe(authenticator)
      .pipe(stream);
  });
  
  var httpServer = http.createServer();
  
  ws.install(httpServer);
```
