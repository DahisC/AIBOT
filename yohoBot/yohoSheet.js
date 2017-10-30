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
				// 此處呼叫寫入函式

				var rowsArray = [];

				for (i=0; i < rows.length; i++) {
					rowsArray.push(Number(rows[i].num));
				}

				addRow(addList, rowsArray, displayFunc1, displayFunc2, 0);
			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});

}

function addRow(addList, existsNum, displayFunc1, displayFunc2, currentIndex) {

	var index = currentIndex;

	console.log(existsNum);

	if (index < addList.length) {
		if (existsNum.indexOf(addList[index].Num) >= 0) {
			console.log(addList[index].Num+" 已偵測到碰撞！");
			displayFunc2("COLLISION", addList[index].Num);
			index++;
			addRow(addList, existsNum, displayFunc1, displayFunc2, index);
		} else {
			console.log(addList[index].Num+" 可正常寫入");
			displayFunc2("SUCCESS", addList[index].Num);
			addNewRow();
		}
	} else {
		console.log("迴圈完成");
		displayFunc1("表單寫入完成！")
	}

	function addNewRow() {
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

				var formula = '=HYPERLINK("https://www.yohohongkong.com/product/'+addList[index].Num+'","'+addList[index].Num+'")';

				sheet.addRow({
					'islive': addList[index].isLive,
					'num': formula,
					'brand': addList[index].Brand,
					'name': addList[index].Name,
					'price': addList[index].Price,
					'img': addList[index].Img,
					'classa': addList[index].ClassA,
					'classb': addList[index].ClassB,
					'classc': addList[index].ClassC,
					'sourcecode': addList[index].Code,
					'warranty': addList[index].Warranty,
					// 'sourcecode': addList[index]
				}, 
				function(err, rows) {
					index++;
					addRow(addList, existsNum, displayFunc1, displayFunc2, index);
				});
			}
		],	function(err) {
				if (err) { console.log('Google Spreadsheet Error: '+err)};
		});
	}

	// for (i=0; i < addList.length; i++) {
	// 	if (existsNum.indexOf(addList[i].Num) >= 0 ) {
	// 		console.log(addList[i].Num+" 已偵測到碰撞！");
	// 	} else {
	// 		console.log(addList[i].Num+" 可正常寫入");
	// 	}
	// }

	// for (i=0; i < existsNum.length; i++) {
	// 	console.log("Checking Num "+existsNum[i].num);
	// 	if (addList[currentIndex] == existsNum) {
	// 		console.log("!!");
	// 		currentIndex++;
	// 		addRow(addList, existsNum, displayFunc1, displayFunc2, currentIndex);
	// 	} else {
	// 		console.log("excute function");
	// 		currentIndex++;
	// 		addRow(addList, existsNum, displayFunc1, displayFunc2, currentIndex);
	// 	}
	// }



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