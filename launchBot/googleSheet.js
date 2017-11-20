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

exports.writeIn = function(header, value, product, callback) {

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
			(header == "pchome") ? col = 8 : "";
			(header == "storage") ? col = 9 : "";

			sheet.getCells({
				'min-row': row,
				'max-row': row,
				'min-col': col,
				'max-col': col,
				'return-empty': true
			},	function(err, cells) {
				var cell = cells[0];
				var formula = '=HYPERLINK("'+value+'","商品頁面")';

				if (header == "anyspecs" || header == "ruten" || header == "yahoo" || header == "shopee" || header == "pchome") {
					console.log("將網址 "+value+" 寫入儲存格 "+header+" 中...");
					cell.setValue(formula, null);
				} 
				else if (header == "yohotw") {
					console.log("將編號 "+value+" 寫入儲存格 "+header+" 中...");
					cell.setValue(value, null);
				}
				else if (header == "storage") {
					console.log("雲端小幫手庫存建立完成");
					cell.setValue(value, null);
				}
				else {
					console.log(value+" - 商品 "+product.name+" 上架完成。")
					cell.setValue(value, null);
				}

				console.log("----- ----- 平台上架成功，儲存上架紀錄！ ----- -----");
				callback();

			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}