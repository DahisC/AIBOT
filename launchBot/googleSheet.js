var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

var doc = new GoogleSpreadsheet('12tAQaNWPJyu3XXcVE9vhCcLPkHH9p3ahWfan758QKJk');
var sheet;

exports.getSheet = function(callback) {

	async.series([

		function setAuth(step) {
			var creds = require('./AIBOT-7ac8efcc5bc6.json');
			doc.useServiceAccountAuth(creds, step);
		},

		function getInfoAndWorksheets(step) {
			doc.getInfo(function(err, info) {
				console.log('Loaded doc: '+info.title+' by '+info.author.email);
				sheet = info.worksheets[0];
				step();
			});
		},

		function workingWithRows(step) {
			sheet.getRows({
				offset: 1,
				//limit: 20,
				orderby: 'No'
			}, function(err, rows) {

				console.log('匯入產品資料至清單...');

				var launchList = [];

				for (i=0; i<rows.length; i++) {
					(rows[i].launched == "") ? launchList.push(rows[i]) : "";
				}
				callback(launchList);
				step();
			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});

}

exports.writeIn = function(header, value, product) {

	console.log("將 "+value+" 寫入 "+header+" 中...");

	async.series([

		function setAuth(step) {
			var creds = require('./AIBOT-7ac8efcc5bc6.json');
			doc.useServiceAccountAuth(creds, step);
		},

		function getInfoAndWorksheets(step) {
			doc.getInfo(function(err, info) {
				//console.log('Loaded doc: '+info.title+' by '+info.author.email);
				sheet = info.worksheets[0];
				step();
			});
		},

		function workingWithCells(step) {

			var row = Number(product.no) + 1;
			var col;

			(header == "launched") ? col = 2 : "";
			(header == "anyspecs") ? col = 3 : "";
			(header == "yohotw") ? col = 4 : "";
			(header == "ruten") ? col = 5 : "";
			(header == "yahoo") ? col = 6 : "";
			(header == "shopee") ? col = 7 : "";

			sheet.getCells({
				'min-row': row,
				'max-row': row,
				'min-col': col,
				'max-col': col,
				'return-empty': true
			},	function(err, cells) {
				var cell = cells[0];
				cell.setValue(value, null);
			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}