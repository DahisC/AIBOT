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
	options.addArguments("user-data-dir=C:/Users/user/AppData/Local/Google/Chrome/User Data/Profile 2");

//var productDir = "D:/AIBOT/image/";
var productDir = "D:/AIBOT/DailyGo/img/";
/* ------------------------------------------------------------------------------------------------ */

exports.launch = function() {
	getSheet();
}

function getSheet() {

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
			driver.get('http://tv.dailygo.tw/admin/goods.php?act=add');

			// 姓名
			console.log("等待頁面載入 ...");
			driver.wait(until.elementLocated(By.css('input[name="goods_name"]'))).then(() => {
				console.log("- 頁面載入完成。");
				target = driver.findElement(By.css('input[name="goods_name"]'));
				console.log("- 填入商品名稱。");
				driver.executeScript('arguments[0].value = arguments[1]', target, rows[i].name);
			});

			// 分類
			driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[3]/td[2]/select'))).then(() => {
				console.log("正在尋找分類「"+rows[i].class+"」 ...");
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[3]/td[2]/select/option[contains(text(), "'+rows[i].class+'")]')).then(
					(ele) => {
						console.log("- 成功，已選擇分類"+rows[i].class+"！");
						ele.click();
				}, (err) => {
					console.log("- 失敗，新增「"+rows[i].class+"」分類。");
					driver.findElement(By.css('a[title="添加分類"]')).click();
					driver.findElement(By.css('input[name="addedCategoryName"]')).sendKeys(rows[i].class);
					driver.findElement(By.css('#category_add > a:nth-child(2)')).click();
				});
			});

			// 品牌
			driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[5]/td[2]/select'))).then(() => {
				console.log("正在尋找品牌「"+rows[i].brand+"」 ...");
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[5]/td[2]/select/option[contains(text(), "'+rows[i].brand+'")]')).then(
					(ele) => {
						console.log("- 成功，已選擇品牌"+rows[i].brand+"！");
						ele.click();
				}, (err) => {
					console.log("- 失敗，新增「"+rows[i].brand+"」品牌。");
					driver.findElement(By.css('a[title="添加品牌"]')).click();
					driver.findElement(By.css('input[name="addedBrandName"]')).sendKeys(rows[i].brand);
					driver.findElement(By.css('#brand_add > a:nth-child(2)')).click();
				});
			});

			// 價格
			driver.wait(until.elementLocated(By.css('input[name="shop_price"]'))).then((ele) => {
				console.log("- 填入金額 $ "+rows[i].price);
				ele.clear();
				ele.sendKeys(rows[i].price);
			});

			// 市場價格
			driver.wait(until.elementLocated(By.css('input[name="market_price"]'))).then((ele) => {
				var mPrice = rows[i].price * 1.15;
					mPrice = Math.round(mPrice);
					mPrice = mPrice.toString();
					mPrice = mPrice.split('');
					mPrice[mPrice.length-1] = "8";
					mPrice = mPrice.join('');

				console.log("- 填入市場金額 $ "+mPrice);
				ele.clear();
				ele.sendKeys(mPrice);

			});

			// 上傳第一張圖片
			driver.wait(until.elementLocated(By.css('input[name="goods_img"]'))).then((ele) => {
				if (rows[i].img1 != '') {
					console.log("- 上傳第 1 張圖片。");
					ele.sendKeys(productDir+"image1.png"); 
				}
			});

			// 切換至產品相冊
			driver.wait(until.elementLocated(By.css('#gallery-tab'))).then((ele) => {
				ele.click().then(() => {
					driver.wait(until.elementLocated(By.css('#gallery-table > tbody > tr:nth-child(3) > td > a'))).then((ele) => {
						console.log("載入產品相冊，偵測圖片 ...");
						checkImage();
					});
				});
			});

			function checkImage() {

				clickAddButton();

				function clickAddButton() {
					if (rows[i].img2 != '') {
						console.log("準備上傳第 2 張圖片 ...");
						if (rows[i].img3 != '') {
							console.log("準備上傳第 3 張圖片 ...");
							driver.findElement(By.css('#gallery-table > tbody > tr:nth-child(3) > td > a')).click().then(() => {
								if (rows[i].img4 != '') {
									console.log("準備上傳第 4 張圖片 ...");
									driver.findElement(By.css('#gallery-table > tbody > tr:nth-child(3) > td > a')).click().then(() => {
										if(rows[i].img5 != '') {
											console.log("準備上傳第 5 張圖片 ...");
											driver.findElement(By.css('#gallery-table > tbody > tr:nth-child(3) > td > a')).click().then(() => {
												uploadImage();
											});
										} else {
											uploadImage();
										}
									});
								} else {
									uploadImage();
								}
							});
						} else {
							uploadImage();
						}
					} else {
						uploadImage();
					}
				}

				function uploadImage() {
					if (rows[i].img2 != '') {
						console.log(" - 上傳第 2 張圖片。");
						driver.wait(until.elementLocated(By.css('#gallery-table > tbody > tr:nth-child(3) > td > input[type=file]'))).then((ele) => {
							ele.sendKeys(productDir+"image2.png");
						});
					}
					if (rows[i].img3 != '') {
						console.log(" - 上傳第 3 張圖片。");
						driver.wait(until.elementLocated(By.css('#gallery-table > tbody > tr:nth-child(4) > td > input[type=file]'))).then((ele) => {
							ele.sendKeys(productDir+"image3.png");
						});
					}
					if (rows[i].img4 != '') {
						console.log(" - 上傳第 4 張圖片。");
						driver.wait(until.elementLocated(By.css('#gallery-table > tbody > tr:nth-child(5) > td > input[type=file]'))).then((ele) => {
							ele.sendKeys(productDir+"image4.png");
						});
					}
					if (rows[i].img5 != '') {
						console.log(" - 上傳第 5 張圖片。");
						driver.wait(until.elementLocated(By.css('#gallery-table > tbody > tr:nth-child(6) > td > input[type=file]'))).then((ele) => {
							ele.sendKeys(productDir+"image5.png");
						});
					}
					launchConfirm();
				}

				function launchConfirm() {
					driver.wait(until.elementLocated(By.css('input[value=" 確定 "]'))).then((ele) => {
						console.log("編輯完成，送出頁面 ...");
						ele.click().then(() => {
							console.log(" - 頁面載入完成。");
							driver.wait(until.titleIs('ECSHOP 管理中心 - 商品列表')).then(() => {
								driver.wait(until.elementLocated(By.css('div.list-div tr:nth-child(3) a'))).then((ele) => {
									ele.getAttribute('href').then((href) => {
										console.log("商品 "+rows[i].name+" 上架成功。");
										console.log("-");
										driver.quit();
										writeInSheet((i+1), href, function() {
											i++;
											prepareLaunch(rows, i);
										});
									});
								});
							});
						});

					});
				}
			}
		}





		// i++;
		// prepareLaunch(rows, i);
	}

}