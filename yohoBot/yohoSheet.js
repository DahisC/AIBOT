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

// function addRow(addList, rows, displayFunc1, displayFunc2) {

// 	var index = 0;

// 	excute(index);

// 	function excute(index) {

// 		if (index == addList.length ) {
// 			console.log("寫入完成");
// 			return;
// 		}

// 		for (i=0; i < rows.length; i++) {
// 			console.log("目前寫入："+addList[index].Num);

// 			if (rows[i].num == addList[index]) {
// 				console.log("碰撞偵測！");
// 				index++;
// 				excute(index);
// 				return;
// 			} else {
// 				console.log("開始寫入 ...");
// 				startWrite();
// 			}
// 		}

// 		function startWrite() {

// 			async.series([

// 				function setAuth(step) {
// 					var creds = require('./AIBOT-7ac8efcc5bc6.json');
// 					doc.useServiceAccountAuth(creds, step);
// 				},

// 				function getInfoAndWorksheets(step) {
// 					doc.getInfo(function(err, info) {
// 						console.log('Loaded doc: '+info.title+' by '+info.author.email);
// 						sheet = info.worksheets[0];
// 						step();
// 					});
// 				},

// 				function addRows(step) {

// 					sheet.addRow({
// 						'islive': addList[index].isLive,
// 						'num': addList[index].Num,
// 						'name': addList[index].Name,
// 						'sourcecode': addList[index].Code,
// 						// 'sourcecode': addList[index]
// 					}, 
// 					function(err, rows) {
// 						index++;
// 						excute(index);
// 					});
// 				}
// 			],	function(err) {
// 					if (err) { console.log('Google Spreadsheet Error: '+err)};
// 			});
// 		}

// 	}

// }