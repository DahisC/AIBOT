var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

var doc = new GoogleSpreadsheet('1WKom4pZ4wgQhdVbIOg0dOVxRWc5QAkV_bIuv2JtFbDw');
var sheet;

exports.getStatus = function(callback) {

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

		function getRows(step) {
			sheet.getRows({
				offset: 1,
				orderby: 'Num'
			}, function(err, rows) {
				callback(rows);
			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});

}

exports.addRow = function(addList, callback) {

	//console.log(addList);

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

		function addRows(step) {

			var _rows;
			var index = 0;

			var _rows = [];

			sheet.getRows({
				offset: 1,
				orderby: 'Num'
			}, function(err, rows) {
				for (i=0; i < rows.length; i++) {
					_rows.push(Number(rows[i].num));
				}
				writeIn(addList, "0");
				return;
			});

			function writeIn(addList, index) {

				if (index == addList.length) {
					sheet.getRows({
						offset: 1,
						orderby: 'Num'
					}, function(err, rows) {
						callback(rows);
						return; 
					});
				} else {

					if (_rows.indexOf(addList[index].Num) == -1) {
						console.log(addList[index].Num+"**");
						goAdd();
					}

					function goAdd() {
						sheet.addRow({
						'num': addList[index].Num,
						'launched': addList[index].isLive
					}, function(err, rows) {

						if (index != (addList.length-1)) {
							index++;
							writeIn(addList, index);
						} else if (index == (addList.length-1)) {
							index++;
							writeIn(addList, index);
						}
					});
					}

				}
			}
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});

}

exports.writeIn = function(header, value, row, cb) {
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

			(header == "launched") ? col = 2 : "";
			(header == "timestamp") ? col = 3 : "";
			(header == "yohotw") ? col = 4 : "";
			(header == "ruten") ? col = 5 : "";
			(header == "yahoo") ? col = 6 : "";
			(header == "shopee") ? col = 7 : "";
			(header == "pchome") ? col = 8 : "";

			sheet.getCells({
				'min-row': row,
				'max-row': row,
				'min-col': col,
				'max-col': col,
				'return-empty': true
			},	function(err, cells) {
				var cell = cells[0];
				var formula = '=HYPERLINK("'+value+'","商品頁面")';

				if (header == "anyspecs" || header == "ruten" || header == "yahoo" || header == "shopee" || header == "pchome" || header == "yohotw") {
					console.log("將網址 "+value+" 寫入儲存格 "+header+" 中...");
					cell.setValue(formula, null);
					cb();
				} 
				else if (header == "storage") {
					console.log("雲端小幫手庫存建立完成");
					cell.setValue(value, null);
				}
				else {
					console.log(value+" - 商品 "+product.name+" 上架完成。")
					cell.setValue(value, null);
					cb();
				}

			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}