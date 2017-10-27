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

function writeInSheet(i, header, url, callback) {
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

		function workingWithCells(step) {

			var row = i + 1;

			(header = 'launched') ? col = 1 : '';
			(header = 'yohotw') ? col = 2 : '';
			(header = 'ruten') ? col = 3 : '';
			(header = 'shopee') ? col = 4 : '';
			(header = 'pchome') ? col = 5 : '';


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

			checkYohoTW();

			function checkYohoTW() {
				(rows[i].yohotw == "") ? launchYoho(function() {checkRuten(); }) : checkRuten();
			}

			function checkRuten() {
				(rows[i].ruten == "") ? launchRuten(function() {checkYahoo(); }) : checkYahoo();
			}

			function checkYahoo() {
				(rows[i].yahoo == "") ? launchYahoo(function() {checkShopee(); }) : checkShopee();
			}

			// function checkShopee() {
			// 	(product.shopee == "") ? launchShopee(product, function() {checkPCHome(); }) : checkPCHome();
			// }

			// function checkPCHome() {
			// 	(product.pchome == "") ? launchPCHome(product, function() {checkStorage(); }) : checkStorage(); 
			// }

			// function checkStorage() {
			// 	(product.storage == "") ? createStorage(product, function() {completeLaunch(); }) : completeLaunch();
			// }

			const cls = rows[i].classb;

			var rutenClass;
			var yahooClass;

			if (cls == '手機及配件') {
				rutenClass = "手機、通訊";
				yahooClass = "手機、配件與通訊";
				//
			} else if (cls == '休閑娛樂') {
				rutenClass = "家電、影音周邊";
				yahooClass = "家電與影音視聽";
				//
			} else if (cls == '穿戴式裝置') {
				rutenClass = "電腦、電子、周邊";
				yahooClass = "電腦、平板與周邊";
				//
			} else if (cls == '數碼影像') {
				rutenClass = "相機、攝影機";
				yahooClass = "相機、攝影與周邊";
				//
			} else if (rows[i].classa == '美容及護理') {
				rutenClass = "保養、彩妝";
				yahooClass = "美容保養與彩妝";
				//
			} else if (cls == '大型家電' || '生活電器' || '廚房電器') {
				rutenClass = "家電、影音周邊";
				yahooClass = "家電與影音視聽";
				//
			} else if (cls == '電腦' || '電腦週邊' || '網絡' || '儲存' || '打印' || '組件' || '電競') {
				rutenClass = "電腦、電子、周邊";
				yahooClass = "電腦、平板與周邊";
				//
			} else if (cls == '汽車用品') {
				rutenClass = "電腦、電子、周邊";
				yahooClass = "電腦、平板與周邊";
				//
			} else if (cls == '母嬰' || '兒童') {
				rutenClass = "嬰幼童、母親";
				yahooClass = "嬰幼兒與孕婦";
				//
			} else if (cls == '運動' || '旅行用品' || '戶外') {
				rutenClass = "運動、健身";
				yahooClass = "運動、戶外與休閒";
				//
			} else if (cls == '生活用品') {
				rutenClass = "生活、居家";
				yahooClass = "居家 - 家具與園藝";
				//
			} else {
				rutenClass = "電腦、電子、周邊";
				yahooClass = "電腦、平板與周邊";
			}

			// if (class == '') {
			// 	rutenClass = "電腦、電子、周邊";
			// 	yahooClass = "電腦、平板與周邊";
			// } else if (class == '手機及配件') {
			// 	const rutenClass = "手機、通訊";
			// 	const yahooClass = "手機、配件與通訊";
			// } else if (class == '數碼影像') {
			// 	const rutenClass = "相機、攝影機";
			// 	const yahooClass = "相機、攝影與周邊";
			// } else if (class == '休閑娛樂') {
			// 	const rutenClass = "家電、影音周邊";
			// 	const yahooClass = "家電與影音視聽";
			// } else if (class == '') {
			// 	const rutenClass = "電玩、遊戲";
			// 	const yahooClass = "電玩遊戲與主機";
			// } else if (rows[i].classa == '美容及護理') {
			// 	const rutenClass = "保養、彩妝";
			// 	const yahooClass = "美容保養與彩妝";
			// } else if (rows[i].classb == '母嬰' || rows[i].classb == '兒童') {
			// 	const rutenClass = "嬰幼童、母親";
			// 	const yahooClass = "嬰幼兒與孕婦";
			// } else if (rows[i]. == '') {
			// 	const const rutenClass = "運動、健身";
			// 	const yahooClass = "運動、戶外與休閒";
			// } else if (rows[i]. == '') {
			// 	const rutenClass = "休閒、旅遊";
			// 	const yahooClass = "運動、戶外與休閒";
			// } else if (rows[i]. == '') {
			// 	const rutenClass = "生活、居家";
			// 	const yahooClass = "居家、家具與園藝";
			// } else if (rows[i]. == '') {
			// 	const rutenClass = "玩具、公仔";
			// 	const yahooClass = "玩具、模型與公仔";
			// } else if (rows[i]. == '') {
			// 	const rutenClass = "";
			// 	const yahooClass = "";
			// } else {

			// }


			// 友和台灣上架
			function launchYoho(callback) {

				driver.get('https://www.taiwanyoho.com/x/goods.php?act=add');

				// 姓名
				console.log("等待頁面載入 ...");
				driver.wait(until.elementLocated(By.css('input[name="goods_name"]'))).then(() => {
					console.log("- 頁面載入完成。");
					target = driver.findElement(By.css('input[name="goods_name"]'));
					driver.executeScript('arguments[0].value = arguments[1]', target, rows[i].name);
					console.log("- 填入商品名稱。");
				});

				// 分類
				driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[2]/td[2]/select'))).then(() => {
					console.log("正在尋找分類「"+rows[i].classc+"」 ...");
					driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[2]/td[2]/select/option[contains(text(), "'+rows[i].classc+'")]')).then(
						// 自動選擇對應分類
						(ele) => {						
							ele.click();
							console.log("- 成功，已選擇分類「"+rows[i].classc+"」！");
						// 如果找不到分類，就執行這行
					}, (err) => {
							driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[2]/td[2]/select'))).then(() => {
							driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[2]/td[2]/select/option[contains(text(), "未分類")]')).click();
							console.log("- 失敗，已分類至「未分類」。");
						// console.log("- 失敗，新增「"+rows[i].classc+"」分類。");
						// driver.findElement(By.css('a[title="添加分類"]')).click();
						// driver.findElement(By.css('input[name="addedCategoryName"]')).sendKeys(rows[i].class);
						// driver.findElement(By.css('#category_add > a:nth-child(2)')).click();
						});
					});
				});

				// 品牌
				driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[4]/td[2]/select'))).then(() => {
					console.log("正在尋找品牌「"+rows[i].brand+"」 ...");
					driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[4]/td[2]/select/option[contains(text(), "'+rows[i].brand+'")]')).then(
						(ele) => {
							ele.click();
							console.log("- 成功，已選擇品牌"+rows[i].brand+"！");
					}, (err) => {
						driver.findElement(By.css('a[title="添加品牌"]')).click();
						driver.findElement(By.css('input[name="addedBrandName"]')).sendKeys(rows[i].brand);
						driver.findElement(By.css('#brand_add > a:nth-child(2)')).click();
						console.log("- 失敗，新增「"+rows[i].brand+"」品牌。");
					});
				});

				// 供應商
				driver.wait(until.elementLocated(By.css('#general-table > tbody > tr:nth-child(5) > td:nth-child(2) > div > ul > li > input'))).then((ele) => {
					console.log("正在選擇供應商 ...");
					ele.click().then(() => {
						driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[5]/td[2]/div/div/ul/li[contains(text(), "香港友和")]'))).then((ele) => {
							ele.click();
							console.log("已選擇供應商「香港友和」！");
						});
					});
				});

				// 售價
				driver.wait(until.elementLocated(By.css('#general-table > tbody > tr:nth-child(6) > td:nth-child(2) > input[type="text"]:nth-child(1)'))).then((ele) => {
					console.log("- 填入售價。");
					driver.executeScript("arguments[0].value = arguments[1]", ele, rows[i].price);
				});

				// 市場售價
				// var marketPriceMultiplying = ((Math.random()/10) + 1.1);
				var mPrice = Math.floor(rows[i].price * ((Math.random()/10) + 1.1));
				mPrice = mPrice.toString();
				mPrice = mPrice.split('');
				mPrice[mPrice.length-2] = "8";
				mPrice[mPrice.length-1] = "0";
				mPrice = mPrice.join('');

				driver.wait(until.elementLocated(By.css('#general-table > tbody > tr:nth-child(7) > td:nth-child(2) > input[type="text"]:nth-child(1)'))).then((ele) => {
					console.log("填入市場售價。");
					ele.clear();
					driver.executeScript("arguments[0].value = arguments[1]", ele, mPrice);
				});

				// 上傳圖片
				driver.wait(until.elementLocated(By.css('#general-table > tbody > tr:nth-child(11) > td:nth-child(2) > div > input'))).then((ele) => {
					ele.sendKeys(productDir+"image1.png");
				});

				// 重量
				driver.wait(until.elementLocated(By.css('#general-table > tbody > tr:nth-child(12) > td:nth-child(2) > input[type="text"]:nth-child(1)'))).then((ele) => {
					ele.clear();
					ele.sendKeys(1);
				});

				// 保養條款
				driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[16]/td[2]/select'))).then((ele) => {
					console.log("正在選擇保養條款 ...")
					driver.wait(until.elementLocated(By.xpath('//*[@id="general-table"]/tbody/tr[16]/td[2]/select/option[contains(text(), "'+rows[i].warranty+'")]'))).then((ele) => {
						console.log("已選擇保養條款：「"+rows[i].warranty+"」");
						ele.click();
					});
				});

				
				/* 切換至詳細描述後新增原始碼
				 * 此處需切換頁面框架，才可正確執行
				 */
				 

				driver.wait(until.elementLocated(By.css('#detail-tab'))).then((ele) => {
					console.log("準備切換頁面框架 ...")
				 	ele.click().then(() => {
				 		console.log("- 切換成功，準備填入原始碼 ...")
				 		driver.switchTo().frame('goods_desc___Frame').then(() => {
				 			driver.wait(until.elementLocated(By.css('div[title="原始碼"]'))).then((ele) => {
				 				ele.click().then(() => {
				 					driver.wait(until.elementLocated(By.css('textarea.SourceField'))).then((ele) => {
				 						driver.executeScript('arguments[0].value = arguments[1]', ele, rows[i].sourcecode);
				 						console.log("- 填入原始碼。");
				 						// 切換為原本的頁面框架
				 						driver.switchTo().defaultContent();
				 					});
				 				})
				 			});
				 		});
				 	});
				});

				// 回產品列表頁面
				driver.wait(until.elementLocated(By.css('#tabbody-div > form > div > input:nth-child(2)'))).then((ele) => {
					ele.click().then(() => {
						driver.wait(until.elementLocated(By.css('div.list-div tr:nth-child(1) td:nth-child(2)'))).then((ele) => {
							driver.wait(until.elementTextIs(ele, "添加產品成功。")).then(() => {
								driver.get('https://www.taiwanyoho.com/x/goods.php?act=list');
							});
						});
					});
				});

				// 修改訂貨天數
				// driver.wait(until.elementLocated(By.css('#listDiv > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(12) span'))).then((ele) => {
				// 	// driver.executeScript("arguments[0].innerText = arguments[1]", ele, 50);
				// 	ele.click();
				// 	driver.executeScript("arguments[0].innerText = arguments[1]", ele, 10);
				// 	ele.sendKeys(driver.Key.ENTER);
				// });

				// 寫入上架進度
				driver.wait(until.elementLocated(By.css('div.list-div tr:nth-child(2) td a:nth-child(1)'))).then((ele) => {
					ele.getAttribute('href').then((url) => {
						writeInSheet(i, 'yohotw', url, callback);
					});
				});
			} // func launchYoho

			function launchRuten(callback) {
				
				driver.get('https://mybidu.ruten.com.tw/upload/step1.htm');

				driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div > div > a.rt-upload-tool-item.rt-upload-tool-oneitem > span'))).then((ele) => {
					ele.click();
				});

				console.log(rutenClass);

				// 分類
				driver.wait(until.elementLocated(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(), "'+rutenClass+'")]'))).then((ele) => {
					ele.click();
				});
			}
		} // func launchProduct
	} // func startLaunch
} // func prepareLaunch
