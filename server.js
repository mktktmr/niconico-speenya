var express = require('express');
var app = express();
var fs = require('fs');
var settings = require('./private/settings.json');
console.log(settings.auth.keyPath);
console.log(settings.auth.certPath);
var options = {
  key: fs.readFileSync(settings.auth.keyPath),
  cert: fs.readFileSync(settings.auth.certPath)
};
var https = require('https').createServer(options, app);
var io = require('socket.io')(https);
var extend = require('util')._extend;

require('console-stamp')(console, '[HH:MM:ss.l]');

var refererCheck = function (req, res, next) {
  if (req.get('Referer')) {
    next();
  } else {
    res.status(404).end();
  }
};

app.get('/comment/:comment', refererCheck, function (req, res) {
  var msg = extend({ body: req.param('comment') }, req.query);
  console.log('comment: ' + JSON.stringify(msg));
  io.emit('comment', msg);
  res.end();
});

app.get('/comment', refererCheck, function (req, res) {
  var msg = extend({}, req.query);
  console.log('comment: ' + JSON.stringify(msg));
  io.emit('comment', msg);
  res.end();
});

app.get('/like', refererCheck, function (req, res) {
  var msg = extend({}, req.query);
  console.log('like: ' + JSON.stringify(msg));
  io.emit('like', msg);
  res.end();
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  console.log('connected: ' + socket.request.connection.remoteAddress);

  socket.on('disconnect', function () {
    console.log('disconnected: ' + socket.request.connection.remoteAddress);
  });
});

https.listen(process.env.PORT || 2525);
