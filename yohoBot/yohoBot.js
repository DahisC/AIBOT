var async = require('async');
var rimraf = require('rimraf');
var request = require('request');
var fs = require('fs');

var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;

var chrome = require('selenium-webdriver/chrome');

/* ------------------------------------------------------------------------------------------------ */

// configure browser options ...
var options = new chrome.Options()
	//options.addArguments("user-data-dir=D:/Bot/Default");
	options.addArguments("user-data-dir=C:/Users/khpr/AppData/Local/Google/Chrome/User Data/Default");

//var productDir = "D:/AIBOT/image/";
var productDir = "C:/Users/khpr/Downloads/AIBOT/yohoBot/img/";
/* ------------------------------------------------------------------------------------------------ */

exports.launch = function() {
	getSheet();
}

function getSheet() {

	var GoogleSpreadsheet = require('google-spreadsheet');
	var async = require('async');

	var doc = new GoogleSpreadsheet('1WKom4pZ4wgQhdVbIOg0dOVxRWc5QAkV_bIuv2JtFbDw');
	var sheet;

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
				orderby: 'No'
			}, function(err, rows) {

				prepareLaunch(rows, 0);

			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}

function writeInSheet(i, url, callback) {
	var GoogleSpreadsheet = require('google-spreadsheet');
	var async = require('async');

	var doc = new GoogleSpreadsheet('1AVBztxQ3H4HFTulAoJ-gr17KDoNtNB1ajK5TrMxJFxI');
	var sheet;

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

		function workingWithCells(step) {

			var row = i + 1;
			var col = 1;

			sheet.getCells({
				'min-row': row,
				'max-row': row,
				'min-col': col,
				'max-col': col,
				'return-empty': true
			},	function(err, cells) {
				var cell = cells[0];
				var formula = '=HYPERLINK("'+url+'","商品頁面")';

				console.log("將網址 "+url+" 寫入儲存格中...");
				cell.setValue(formula, null);
				callback();

			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}

function prepareLaunch(rows, index) {

	var i = index;

	console.log("第 "+(i+1)+" 列～～～～～～～～～～");

	console.log(i+'/'+rows.length);

	if (i == rows.length) {
		console.log("DONE");
	} else {
		if (rows[i].launched == '') {
			startLaunch();
			// func StartLaunch();
		} else {
			console.log("產品 "+rows[i].name+" 已上架");
			i++;
			prepareLaunch(rows, i);
		}
	}

	function startLaunch() {
		console.log("正在上架 "+rows[i].name+" ...");

		saveImage();

		function saveImage() {
			async.series([
				function deleteDir(callback) {
					rimraf(productDir, function() { callback(null); });
				},

				function createDir(callback) {
					
					setTimeout(func_createDir, 3000);

					function func_createDir() {
						fs.mkdirSync(productDir, function(err) {
							if (err) {}
						});
						callback(null);
					}
				},

				function downloadImage(callback) {
					// 此處不能使用這個函式轉換執行路徑，會影響第二次按下按鈕時的刪除資料夾動作
					// 解法為在底下的寫入照片時加上寫入路徑即可
					//process.chdir(productDir);
					setTimeout(func_saveImages, 1500);
						function func_saveImages() {
							if (rows[i].img != '') {
								request(rows[i].img).pipe(fs.createWriteStream(productDir+'image1.png'));
							}
							// if (rows[i].img2 != '') {
							// 	request(rows[i].img2).pipe(fs.createWriteStream(productDir+'image2.png'));
							// }
							// if (rows[i].img3 != '') {
							// 	request(rows[i].img3).pipe(fs.createWriteStream(productDir+'image3.png'));
							// }
							// if (rows[i].img4 != '') {
							// 	request(rows[i].img4).pipe(fs.createWriteStream(productDir+'image4.png'));
							// }
							// if (rows[i].img5 != '') {
							// 	request(rows[i].img5).pipe(fs.createWriteStream(productDir+'image5.png'));
							// }
		 					launchProduct();
						}
				}
			]);
		}

		function launchProduct() {
			var driver = new webdriver.Builder()
				.forBrowser('chrome')
				.setChromeOptions(options)
				.build();

			var target;

			console.log(rows[i]);

			if (rows[i].yohotw == '') { launchYoho(); }

			// 友和台灣上架

			function launchYoho() {

				driver.get('https://www.taiwanyoho.com/x/goods.php?act=add');

				// 姓名
				console.log("等待頁面載入 ...");
				driver.wait(until.elementLocated(By.css('input[name="goods_name"]'))).then(() => {
					console.log("- 頁面載入完成。");
					target = driver.findElement(By.css('input[name="goods_name"]'));
					console.log("- 填入商品名稱。");
					driver.executeScript('arguments[0].value = arguments[1]', target, rows[i].name);
				});

				// 分類
				driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[2]/td[2]/select'))).then(() => {
					console.log("正在尋找分類「"+rows[i].classc+"」 ...");
					driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[2]/td[2]/select/option[contains(text(), "'+rows[i].classc+'")]')).then(
						(ele) => {
							console.log("- 成功，已選擇分類"+rows[i].classc+"！");
							ele.click();
					}, (err) => {
						console.log("- 失敗，新增「"+rows[i].classc+"」分類。");
						driver.findElement(By.css('a[title="添加分類"]')).click();
						driver.findElement(By.css('input[name="addedCategoryName"]')).sendKeys(rows[i].class);
						driver.findElement(By.css('#category_add > a:nth-child(2)')).click();
					});
				});
			}

		} // func launchProduct()
	} // func startLaunch
} // func prepareLaunch