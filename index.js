var app = require('express')();
var express = require('express');

var http = require('http').Server(app),
	port = 9001;

app.use(express.static('bootstrap/css'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

http.listen(port, function() {
	console.log("Server started on port: "+port);
});