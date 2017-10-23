var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

var doc = new GoogleSpreadsheet('1WKom4pZ4wgQhdVbIOg0dOVxRWc5QAkV_bIuv2JtFbDw');
var sheet;

exports.getStatus = function(addList, displayFunc1, displayFunc2) {

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
				addRow(addList, rows, displayFunc1, displayFunc2);
			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});

}

function addRow(addList, rows, displayFunc1, displayFunc2) {

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

			displayFunc2("表單寫入中 ...");

			var index = 0;
			writeIn(addList, index);

			function writeIn(addList, ii) {

				console.log("++++++++++++++++++");
				console.log(addList[0].Name);
				console.log(ii);

				// 碰撞偵測
				for (i=0; i < rows.length; i++) {
					if (rows[i].num == addList[index].Num) {
						index++;
						writeIn(addList, index);
						return;
					}
				}

				// 完成偵測
				if (index == addList.length) {
					sheet.getRows({
						offset: 1,
						orderby: 'Num'
					}, function(err, rows) {
						//callback(rows);
						
						displayFunc2("表單寫入完成");

						return; 
					});
				} else {

					sheet.addRow({
						'islive': addList[index].isLive,
						'num': addList[index].Num,
						'name': addList[index].Name,
						'sourcecode': addList[index].Code,
						// 'sourcecode': addList[index]
					}, function(err, rows) {


					});

				}
			}
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});

}