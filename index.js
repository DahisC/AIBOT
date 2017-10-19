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
var yohoSheet = require('./yohoBot/yohoSheet.js');
var yohoBot = require('./yohoBot/yohoBot.js');

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

	// socket.on('btn_search', function(searchArray) {
	// 	var yohoCrawler = require('./yohoBot/yohoCrawler.js');
	// 	yohoCrawler.searchYoho(searchArray, function(resultArray) {
	// 		console.log("Received display request, displaying search results on webpage...")
	// 		io.emit('displayResult', resultArray);
	// 	});
	// });

	socket.on('btn_search', function(searchArray) {
		var yohoCrawler = require('./yohoBot/yohoCrawler.js');

		yohoCrawler.searchYoho(searchArray, func1, func2);

		function func1(resultArray) {
			console.log("Received display request, displaying search results on webpage...");
			io.emit('searchResult', resultArray);
		}

		function func2(now, all) {
			io.emit('searchBarUpdate', now, all);
		}
	});

	socket.on('sheetResult', function(resultArray) {
		yohoSheet.getStatus(function(rows) {
			io.emit('getResults', resultArray, rows);
		});
	});

	socket.on('btn_launch', function(_resultArray, _addList) {
		yohoSheet.addRow(_addList, function(rows) {
			yohoBot.launching(_resultArray, rows, func1, func2);

			function func1(text) {
				io.emit('displayProgress', text);
			}

			function func2(product, count) {
				io.emit('currentProgress', product, count);
			}
		});
	});

});

exports.refreshList = function() {
	googleSheet.getSheet(function(launchList) {
		console.log("上架完成。");
		io.emit('getList', launchList);
	});
}