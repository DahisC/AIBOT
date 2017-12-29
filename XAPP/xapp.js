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
	options.addArguments("user-data-dir=/Users/Dahis/Library/Application Support/Google/Chrome/Default");

//var productDir = "D:/AIBOT/image/";
var productDir = "/Users/Dahis/Desktop/AIBOT/XAPP/img/";
/* ------------------------------------------------------------------------------------------------ */

exports.launch = function() {
	getSheet();
}

function getSheet() {

	var GoogleSpreadsheet = require('google-spreadsheet');
	var async = require('async');

	var doc = new GoogleSpreadsheet('1IsZ88zJWotdNgJoqoe7OzsbDRWGNwPV-83lWtPWE7fw');
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

	var doc = new GoogleSpreadsheet('1IsZ88zJWotdNgJoqoe7OzsbDRWGNwPV-83lWtPWE7fw');
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
				cell.setValue("D", null);
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
							if (rows[i].img1 != '') {
								request(rows[i].img1).pipe(fs.createWriteStream(productDir+'image1.png'));
							}
							if (rows[i].img2 != '') {
								request(rows[i].img2).pipe(fs.createWriteStream(productDir+'image2.png'));
							}
							if (rows[i].img3 != '') {
								request(rows[i].img3).pipe(fs.createWriteStream(productDir+'image3.png'));
							}
							if (rows[i].img4 != '') {
								request(rows[i].img4).pipe(fs.createWriteStream(productDir+'image4.png'));
							}
							if (rows[i].img5 != '') {
								request(rows[i].img5).pipe(fs.createWriteStream(productDir+'image5.png'));
							}
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

			console.log("上架中，啟動瀏覽器。");
			driver.get('http://dailygobox.com/Admin/default.html');
			driver.wait(until.elementLocated(By.css('.navbar-brand-text'))).then(() => {
				driver.switchTo().frame('mainPage').then(() => {
					console.log("Switched to Main frame");
					driver.wait(until.elementLocated(By.css('i.icon.fa-plus-square'))).then((ele) => {
						ele.click();
					});
				});
			});
		
			// 分類
			driver.wait(until.elementLocated(By.xpath('//*[@id="mainhtml"]/div/div[1]/div[2]/div/div[2]/ol/div/ul/li[contains(text(),"'+rows[i].class+'")]'))).then((ele) => {
				ele.click().then(() => {
					driver.wait(until.elementLocated(By.css('#btnNext'))).then((ele) => {
						ele.click();
					});
				});
			});

			// 品牌
			driver.wait(until.elementLocated(By.css('#information_c > div:nth-child(1) > ul > li:nth-child(3) > abbr > div'))).then((ele) => {
				console.log("- 填入品牌。");
				ele.click().then(() => {
					driver.wait(until.elementLocated(By.xpath('//*[@id="information_c"]/div[1]/ul/li[3]/abbr/div/div/ul/li[contains(text(), "'+rows[i].brand+'")]'))).then((ele) => {
						driver.executeScript("arguments[0].click()", ele);
					});
				});
			});


			// 商品名稱
			driver.wait(until.elementLocated(By.css('#ctl00_contentHolder_txtProductName'))).then((ele) => {
				console.log("- 填入商品名稱。");
				//driver.executeScript("arguments[0].value = arguments[1]", ele, rows[i].name);
				ele.sendKeys(rows[i].name);
			});


			// 一口價 #ctl00_contentHolder_txtSalePrice
			driver.wait(until.elementLocated(By.css('#ctl00_contentHolder_txtSalePrice'))).then((ele) => {
				console.log("- 填入價格。");
				driver.executeScript("arguments[0].value = arguments[1];", ele, rows[i].price);
			});

			// 商品庫存 #ctl00_contentHolder_txtStock
			driver.wait(until.elementLocated(By.css('#ctl00_contentHolder_txtStock'))).then((ele) => {
				console.log("- 填入庫存數量。");
				driver.executeScript("arguments[0].value = 1000", ele);
				//ele.sendKeys(1000);
			});

			// 上傳圖片
			driver.wait(until.elementLocated(By.css('#imageContainer > span > div.col-sm-12 > div:nth-child(1) > input.file.uploadFilebtn'))).then((ele) => {
				ele.sendKeys(productDir+"image1.png");
			});

			//
			driver.wait(until.elementLocated(By.css('#mainhtml > div > div > div > div > h2'))).then((ele) => {
				console.log("上架完成");
				writeInSheet((i+1), "D", function() {
					driver.sleep(2000);
					i++;
					driver.quit();
					prepareLaunch(rows, i);
				});
			});
		}

	}

}