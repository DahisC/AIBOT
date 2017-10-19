var app = require('express')();
var express = require('express');

var http = require('http').Server(app),
	port = 9001;

//

app.use(express.static('bootstrap/css'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/yohoBot', function(req, res) {
	res.sendFile(__dirname + '/yohoBot.html');
});

http.listen(port, function() {
	console.log("Server started on port: "+port);
});

var googleSheet = require('./launchBot/googleSheet.js');

//

var io = require('socket.io')(http);
var async = require('async');

io.on('connection', function(socket) {
	console.log("A user connected");

	socket.on('importSelectList', function() {

		googleSheet.getSheet(function(launchList) {
			console.log("匯入完成。");
			io.emit('getList', launchList);
		});

	});

	socket.on('startLaunch', function(product) {
		var launchBot = require('./launchBot/launchBot.js');
		launchBot.saveImage(product);
		launchBot.launching(product);
	});


});

// 



exports.refreshList = function() {
	googleSheet.getSheet(function(launchList) {
		console.log("上架完成。");
		io.emit('getList', launchList);
	});
}