var app = require('express')();
var express = require('express');

var http = require('http').Server(app),
	port = 9001;

//

app.use(express.static('bootstrap/css/'));
app.use(express.static('bootstrap/js'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/yohoBot', function(req, res) {
	res.sendFile(__dirname + '/yohoBot.html');
});

app.get('/dailygo', function(req, res) {
	res.sendFile(__dirname + '/dailygo.html');
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

	// --------------- YohoBot -----------------

	socket.on('btn_search', (searchRange) => {
		var yohoCrawler = require('./yohoBot/yohoCrawler.js');
		yohoCrawler.searchYoho(searchRange, func1, func2);

		// 此函式將搜尋結果帶回
		function func1(searchResults) {
			io.emit('displayResult', searchResults);
		}

		// 此函式傳遞給爬蟲，爬蟲可以直接呼叫此函式改變前端進度模塊顯示之訊息
		function func2(count, length) {
			io.emit('displayProgress', count, length);
		}
	});

	socket.on('writeIn', (searchResults) => {
		var yohoSheet = require('./yohoBot/yohoSheet.js');
		yohoSheet.getStatus(searchResults, func1, func2);

		function func1(text) {
			io.emit('writeInProgress', text);
		}

		function func2(text, num) {
			io.emit('writeInStatus', text, num);
		}

	});

	socket.on('yohoLaunch', () => {
		var yohoBot = require('./yohoBot/yohoBot.js');
		yohoBot.launch();
	});

	// // --------------- DailyGo -----------------

	socket.on('dailyGoLaunch', () => {
		var DailyGo = require('./DailyGo/DailyGoBot.js');
		DailyGo.launch();
	});

	socket.on('xappLaunch', () => {
		var xapp = require('./XAPP/xapp.js');
		xapp.launch();
	});

});

// 



exports.refreshList = function() {
	googleSheet.getSheet(function(launchList) {
		console.log("上架完成。");
		io.emit('getList', launchList);
	});
}