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
var productDir = "/Users/Dahis/Desktop/AIBOT/yohoBot/img/";
/* ------------------------------------------------------------------------------------------------ */

var googleSheet = require('./googleSheet.js');

//

exports.saveImage = function(product) {

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

		function saveImages(callback) {
			// 此處不能使用這個函式轉換執行路徑，會影響第二次按下按鈕時的刪除資料夾動作
			// 解法為在底下的寫入照片時加上寫入路徑即可
			//process.chdir(productDir);
			setTimeout(func_saveImages, 1500);
				function func_saveImages() {
					request(product.image1).pipe(fs.createWriteStream(productDir+'image1.png'));
 					request(product.image2).pipe(fs.createWriteStream(productDir+'image2.png'));
 					request(product.image3).pipe(fs.createWriteStream(productDir+'image3.png'));
 					callback(null);
				}
		}

		]);


}

exports.launching = function(product) {

	var _product = product;

	function getTime() {
		var time = new Date();
		var now = (time.getMonth()+1)+"/"+time.getDate()+" "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
		return now;
	}

	var driver = new webdriver.Builder()
		.forBrowser('chrome')
		.setChromeOptions(options)
		.build();

	driver.sleep(3000); // 等待圖片寫入

	//driver.manage().window().maximize();

	checkAnyspecs();

	function checkAnyspecs() {
		(product.anyspecs == "") ? launchAnyspecs(product, function() { checkYohoTW(); }) : checkYohoTW();
	}

	function checkYohoTW() {
		(product.yohotw == "") ? launchYohoTW(product, function() {checkRuten(); }) : checkRuten();
	}

	function checkRuten() {
		(product.ruten == "") ? launchRuten(product, function() {checkYahoo(); }) : checkYahoo();
	}

	function checkYahoo() {
		(product.yahoo == "") ? launchYahoo(product, function() {checkShopee(); }) : checkShopee();
	}

	function checkShopee() {
		(product.shopee == "") ? launchShopee(product, function() {checkPCHome(); }) : checkPCHome();
	}

	function checkPCHome() {
		(product.pchome == "") ? launchPCHome(product, function() {checkStorage(); }) : checkStorage(); 
	}

	function checkStorage() {
		(product.storage == "") ? createStorage(product, function() {completeLaunch(); }) : completeLaunch();
	}

	function completeLaunch() {
		driver.get('https://www.google.com.tw/')
		var googleTarget = driver.findElement(By.css('input[value="好手氣"]'));
			googleTarget.getAttribute('value').then(function(value) {
	
			var timeStamp = getTime();
			googleSheet.writeIn("launched", timeStamp, product, function() {
				console.log("商品已上架到各平台。");
			});
		});
	}

	function launchAnyspecs(product, callback) {

		async.series([

			function startLaunch(step) {

				console.log("正在將商品 "+product.name+" 上架到 Anyspecs...");
				// 上架按鈕
				driver.get("https://www.anyspecs.com/product/create");
				// 商品名稱
				driver.findElement(By.xpath('/html/body/div[1]/form/div[2]/div[2]/span/input'))
					.sendKeys(product.name);
				// 商品描述
				driver.findElement(By.xpath('/html/body/div[1]/form/div[3]/div[2]/span/textarea'))
					.sendKeys(product.intro);
				// 原始碼
				driver.findElement(By.xpath('//*[@id="mceu_8"]/button/i'))
					.click();
				driver.findElement(By.className('mce-textbox'))
					.clear();
				// driver.findElement(By.className('mce-textbox'))
				// 	.sendKeys(product.code)

				var targetElement = driver.findElement(By.className('mce-textbox'));
				driver.executeScript("arguments[0].value = arguments[1];", targetElement, product.code);

				//let js = 'var q=document.getElementById("mceu_23");q.innerText="'+product.code+'"';
				driver.findElement(By.xpath('//*[@id="mceu_25"]/button')).click();
				// 商品價格
				var hkprice = product.price/4;
				driver.findElement(By.xpath('/html/body/div[1]/form/div[5]/div[2]/div[2]/input'))
					.sendKeys(hkprice);
				// 儲存頁面
				driver.findElement(By.xpath('/html/body/div[2]/div[2]/button'))
					.click();
				// 擷取商品網址
				var anyspecsUrl = driver.findElement(By.css('link[hreflang="x-default"]'));
				anyspecsUrl.getAttribute('href').then(function(url) {
					googleSheet.writeIn("anyspecs", url, product, function() {
						driver.sleep(3000);
						callback();
					});

				});
			}

		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("anyspecs", "anydone", product);
			//console.log(product.name+" 已上架至 Anyspecs...");
			//cb();
		});
	}

	function launchYohoTW(product, callback) {

		async.series([

			function startLaunch(step) {

				driver.sleep(3000);

				console.log("正在將商品 "+product.name+" 上架到 YohoTW...");
				// 上架頁面
				driver.get("https://www.taiwanyoho.com/x/goods.php?act=add");
				// 商品名稱
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[1]/td[2]/span[1]/input'))
					.sendKeys(product.name);

				// 選擇分類
				driver.findElement(By.css('select[name="cat_id"] option[value="'+product.yohoA+'"]'))
					.click();

				// 供應商
				driver.findElement(By.css('#general-table > tbody > tr:nth-child(5) > td:nth-child(2) > div > ul > li > input'))
					.click();
				driver.sleep(1000);
				var provider = 'ul.chosen-results li[data-option-array-index="'+product.provider+'"]';
				driver.findElement(By.css(provider))
					.click();
				// 保養條款
				var warranty = '#general-table > tbody > tr:nth-child(16) > td:nth-child(2) > select option[value="'+product.warranty+'"]';
				driver.findElement(By.css(warranty))
					.click();

				// 商品價格
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[6]/td[2]/input[1]'))
					.clear();
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[6]/td[2]/input[1]'))
					.sendKeys(product.price);
				// 市場價格
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[7]/td[2]/input[1]'))
					.clear();
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[7]/td[2]/input[1]'))
					.sendKeys(product.mprice);

				// 商品圖片
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[11]/td[2]/div/input'))
					.sendKeys(productDir+"image1.png");

				// 重量
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[12]/td[2]/input[1]'))
					.clear();
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[12]/td[2]/input[1]'))
					.sendKeys("1");

				/* 詳細描述 */
				driver.findElement(By.xpath('//*[@id="detail-tab"]'))
					.click()
				driver.sleep(1000);
				// 載入資料庫
				driver.findElement(By.xpath('//*[@id="detail-table"]/tbody/tr[2]/td[2]/div[1]/input[1]'))
					.sendKeys(product.name);
				driver.findElement(By.xpath('//*[@id="detail-table"]/tbody/tr[2]/td[2]/div[1]/input[2]'))
					.click();
				driver.sleep(1000);
				driver.findElement(By.css('select.proddb_search_result option:nth-child(2)'))
					.click();
				driver.findElement(By.xpath('//*[@id="detail-table"]/tbody/tr[2]/td[2]/div[2]/input[1]'))
					.click();
				driver.sleep(10000);
				// 確認上架
				driver.findElement(By.css('input[type="submit"]'))
					.click();
				driver.sleep(5000);

				// 回產品列表
				driver.findElement(By.xpath('/html/body/h1/span[1]/a'))
					.click();

				// 回產品編輯頁
				driver.sleep(3000);
				driver.findElement(By.css('div.list-div tr:nth-child(2) a:nth-child(2)'))
					.click();
				driver.sleep(3000);
				driver.findElement(By.xpath('//*[@id="gallery-tab"]'))
					.click();
				// 插入 image2
				driver.findElement(By.xpath('//*[@id="gallery-table"]/tbody/tr[3]/td/div/input'))
					.sendKeys(productDir+"image2.png");
				driver.findElement(By.xpath('//*[@id="gallery-table"]/tbody/tr[3]/td/div/div[3]/input[2]'))
					.click();
				driver.sleep(1000);
				// 插入 image3
				driver.findElement(By.xpath('//*[@id="gallery-table"]/tbody/tr[3]/td/div/input'))
					.sendKeys(productDir+"image3.png");
				driver.findElement(By.xpath('//*[@id="gallery-table"]/tbody/tr[3]/td/div/div[3]/input[2]'))
					.click();
				driver.sleep(1000);

				// 回產品頁
				driver.get('https://www.taiwanyoho.com/x/goods.php?act=list');

				// // 訂貨天數
				// var _orderdays = driver.findElement(By.css('div.list-div tr:nth-child(2) td:nth-child(12) span'));
				// driver.sleep(1000);
				// driver.findElement(By.css('div.list-div tr:nth-child(2) td:nth-child(12) span'))
				// 	.sendKeys("10");

				// 擷取產品編號
				var aTag = driver.findElement(By.css('div.list-div tr:nth-child(2) a:nth-child(1)'));
				aTag.getAttribute('href').then(function(href) {
					var yohoNo = href.split("=");
					yohoNo = yohoNo[1];
					product.yohotw = yohoNo;
					/* 在此處莫名其妙解決了 callback 會異步執行的問題，成功帶回產品編號 */
					// googleSheet.writeIn("yohotw", yohoNo, product);
					// callback();
					//step();
					googleSheet.writeIn("yohotw", yohoNo, product, function() {
						driver.sleep(3000);
						callback();
					});

				});
			}	


		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("yohotw", "twdone", product);
			//console.log(product.name+" 已上架至 Anyspecs...");
		});
	}

	function launchRuten(product, callback) {

		console.log("----- ----- 目前上架平台：露天拍賣 ----- -----");
		
		// 上架頁面
		driver.get('https://mybidu.ruten.com.tw/upload/step1.htm');

		// 選擇上架方式
		driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div > div > a.rt-upload-tool-item.rt-upload-tool-oneitem > span'))).then((ele) => {
			ele.click();
		});

		//上傳圖片
		// driver.wait(until.elementLocated(By.css('#image_uploader > div > div.tool-bar.hint > div > label.action > input'))).then((ele) => {
		// 	ele.sendKeys(productDir+"image1.png");
		// 	console.log("- 上傳圖片");
		// });

		driver.wait(until.elementLocated(By.css('input[type="file"].add-local-input'))).then((ele) => {
			console.log("準備上傳圖片 ...");
			ele.sendKeys(productDir+"image1.png").then(() => {
				console.log("- 上傳第 1 張圖片。");
				driver.sleep(1500);
				driver.wait(until.elementLocated(By.css('input[type="file"].add-local-input'))).then((ele) => {
					ele.sendKeys(productDir+"image2.png").then(() => {
						console.log("- 上傳第 2 張圖片。");
						driver.sleep(1500);
						driver.wait(until.elementLocated(By.css('input[type="file"].add-local-input'))).then((ele) => {
							ele.sendKeys(productDir+"image3.png").then(() => {
								console.log("- 上傳第 3 張圖片。");
							});
						});
					});
				});
			});
			// console.log("- 上傳圖片。");
		});

		// 分類
		driver.wait(until.elementLocated(By.css('ul.class-path-node-list li[rt-class-id="'+product.rutenA+'"]'))).then((ele) => {
			driver.sleep(1000);
			//ele.click().then(() => {
			driver.executeScript("arguments[0].click()", ele).then(() => {
				console.log("- 選擇分類「"+product.rutenA+"」。");
				driver.wait(until.elementLocated(By.css('ul.class-path-node-list li[rt-class-id="'+product.rutenB+'"]'))).then((ele) => {
					driver.sleep(1000);
					//ele.click().then(() => {
					driver.executeScript("arguments[0].click()", ele).then(() => {
						console.log("- 選擇分類「"+product.rutenA	+"」。");
						// if (rutenClass3 != 'None') {
						// 	driver.wait(until.elementLocated(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(), "'+rutenClass3+'")]'))).then((ele) => {
						// 		driver.sleep(1000);
						// 		driver.executeScript("arguments[0].click()", ele);
						// 		console.log("- 選擇分類「"+rutenClass3+"」。");
						// 	});
						// }
					});
				});
			});
		});

		//driver.sleep(10000);

		// 商品名稱
		driver.wait(until.elementLocated(By.css('#g_name'))).then((ele) => {
			driver.executeScript("arguments[0].value = arguments[1]", ele, "【T"+product.yohotw+"】"+product.name+"《Ai-Tec》");
			console.log("- 填入商品名稱"+product.name+"。");
		});

		// 店家分類
		driver.wait(until.elementLocated(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[2]/td/select/option[contains(text(), "☆注目商品☆")]'))).then((ele) => {
			ele.click();
			console.log("- 選擇店家分類「☆注目商品☆」。");
		});

		// 商品價格
		driver.wait(until.elementLocated(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[3]/td/div[1]/label/input'))).then((ele) => {
			driver.executeScript("arguments[0].value = arguments[1]", ele, product.price).then(() => {
				console.log("- 填入商品價格「"+product.price+"」。");
				// 商品數量
				driver.wait(until.elementLocated(By.xpath('//*[@id="show_num"]'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, 999);
				});
			});
		});

		// Youtube 影片
	// 	if (product.video !== 0) {
	// // 				product.video = "https://youtu.be/"+product.video;
	// // 				driver.findElement(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[10]/td/input'))
	// // 					.sendKeys(product.video);
	// // 			}
		if (product.video !== 0) {
			driver.wait(until.elementLocated(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[10]/td/input'))).then((ele) => {
				ele.clear().then(() => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, "https://youtu.be/"+product.video);
				});
			});
		}

		// 原始碼
		driver.wait(until.elementLocated(By.css('#mce_7 > button > i'))).then((ele) => {
			driver.sleep(1000);
			ele.click().then(() => {
				driver.wait(until.elementLocated(By.className('mce-textbox'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, product.rycode).then(() => {
						driver.wait(until.elementLocated(By.xpath('//*[@id="mce_46"]/button'))).then((ele) => {
							ele.click();
							console.log("- 填入原始碼。");
						});
					});
				});
			});
		}, (err) => {
		});

		// 特別醒目標籤
		driver.wait(until.elementLocated(By.css('#g_flag_6'))).then((ele) => {
			ele.click().then(() => {
				driver.wait(until.elementLocated(By.css('#g_flag_11'))).then((ele) => {
					ele.click();
				});
			});
		});

		// 物品所在地
		driver.wait(until.elementLocated(By.xpath('//*[@id="location_tw"]/option[contains(text(), "高雄市")]'))).then((ele) => {
			ele.click();
		});

		// driver.wait(until.elementLocated(By.css('#image_uploader > div > div.tool-bar.hint > div > label.action > input'))).then((ele) => {
		// 	ele.sendKeys(productDir+"image1.png");
		// 	console.log("- 上傳圖片");
		// });

		// 交易與運送方式
		// 選擇預設值
		driver.wait(until.elementLocated(By.css('#main_form > div.upload-step.step4 > table > tbody > tr:nth-child(1) > td > ul > li > label > input'))).then((ele) => {
			ele.click();
			checkImage();
		});

		// 
		
		// function checkImage() {
		// 	console.log("頁面完成，等待圖片上傳完畢 ...");
		// 	driver.wait(until.elementLocated(By.css('div.thumbnail:nth-child(1) div.img'))).then((ele) => {
		// 		ele.getAttribute('style').then((style) => { 
		// 			if (style.indexOf('showpic?tofile=') >= 0) {
		// 				console.log("- 圖片上傳完成，即將上架商品。");
		// 				driver.sleep(1000);
		// 				RutenLaunching();
		// 			} else {
		// 				driver.sleep(1000);
		// 				checkImage();
		// 			}
		// 		});
		// 	});
		// }

		function checkImage() {
			console.log("檢查圖片上傳進度... ")
			driver.wait(until.elementLocated(By.css('div.thumbnail:nth-child(1) div.img'))).then((ele) => {
				ele.getAttribute('style').then((style) => {
					if (style.indexOf('showpic?tofile=') < 0) {
						driver.sleep(1000);
						console.log("等待第 1 張圖片上傳 ...");
						checkImage();
					} else {
						// console.log("- 圖片上傳完成，即將上架商品。");
						// YahooLaunching();
						driver.wait(until.elementLocated(By.css('div.thumbnail:nth-child(2) div.img'))).then((ele) => {
							ele.getAttribute('style').then((style) => {
								if (style.indexOf('showpic?tofile=') < 0) {
									driver.sleep(1000);
									console.log("等待第 2 張圖片上傳 ...");
									checkImage();
								} else {
									driver.wait(until.elementLocated(By.css('div.thumbnail:nth-child(3) div.img'))).then((ele) => {
										ele.getAttribute('style').then((style) => {
											if (style.indexOf('showpic?tofile=') < 0) {
												driver.sleep(1000);
												console.log("等待第 3 張圖片上傳 ...");
												checkImage();
											} else {
												console.log("- 圖片上傳完成，即將上架商品。");
												RutenLaunching();
											}
										});
									});
								}
							});
						});
					}
				});
			});
		}


		function RutenLaunching() {
			driver.wait(until.elementLocated(By.css('#main_form > div.text-center.form-submit-button-wrap > input.rt-button.rt-button-submit.item-upload-submit'))).then((ele) => {
				ele.click().then(() => {
					driver.wait(until.elementLocated(By.css('input[value="確認送出"]'))).then((ele) => {
						ele.click().then(() => {
							driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div.rt-text-large.item-upload-result > span'))).then((ele) => {
								driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div.rt-panel.rt-panel-bg.item-finish > div > table > tbody > tr:nth-child(2) > td.text-left > a'))).then((ele) => {
									ele.getAttribute('href').then((url) => {
										googleSheet.writeIn("ruten", url, product, function() {
											driver.sleep(3000);
											callback();
										});
									});
								});
							});
						});
					});
				});
			});
		}
	}

	// function launchRuten(product, callback) {

	// 	async.series([

	// 		function startLaunch(step) {

	// 			driver.sleep(3000);
				
	// 			console.log("正在將商品 "+product.name+" 上架到 Ruten...");

	// 			driver.get('https://mybidu.ruten.com.tw/upload/step1.htm');
	// 			driver.findElement(By.xpath('/html/body/div/div[3]/div/div/a[1]/span'))
	// 				.click();

	// 			// 商品分類
	// 			driver.sleep(1000);
	// 			driver.findElement(By.css('ul.class-path-node-list li[rt-class-id="'+product.rutenA+'"]'))
	// 				.click();
	// 			driver.sleep(2000);
	// 			driver.findElement(By.css('ul.class-path-node-list li[rt-class-id="'+product.rutenB+'"]'))
	// 				.click();

	// 			// 插入圖片
	// 			driver.findElement(By.xpath('//*[@id="image_uploader"]/div/div[1]/div/label[1]/input'))
	// 				.sendKeys(productDir+"image1.png");
	// 			driver.findElement(By.xpath('//*[@id="image_uploader"]/div/div[1]/div/label[1]/input'))
	// 				.sendKeys(productDir+"image2.png");
	// 			driver.findElement(By.xpath('//*[@id="image_uploader"]/div/div[1]/div/label[1]/input'))
	// 				.sendKeys(productDir+"image3.png");

	// 			// 商品名稱
	// 			driver.findElement(By.xpath('//*[@id="g_name"]'))
	// 				.sendKeys("【T"+product.yohotw+"】"+product.name+"《Ai-Tec》");
	// 			// 店家分類
	// 			driver.findElement(By.css('select[name="user_class_select"] option[value="4090576"]'))
	// 				.click();
	// 			// 商品價格
	// 			driver.findElement(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[3]/td/div[1]/label/input'))
	// 				.sendKeys(product.price);
	// 			// 商品數量
	// 			driver.findElement(By.xpath('//*[@id="show_num"]'))
	// 				.sendKeys("999");
	// 			// 自用料號
	// 			driver.findElement(By.xpath('//*[@id="goods_no"]'))
	// 				.sendKeys("T"+product.yohotw);
	// 			// Youtube 影片
	// 			if (product.video !== 0) {
	// 				product.video = "https://youtu.be/"+product.video;
	// 				driver.findElement(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[10]/td/input'))
	// 					.sendKeys(product.video);
	// 			}
	// 			// 原始碼
	// 			driver.findElement(By.xpath('//*[@id="mce_7"]/button/i'))
	// 				.click();
	// 			// driver.findElement(By.className('mce-textbox'))
	// 			// 	.sendKeys(product.rycode);
	// 			var targetElement = driver.findElement(By.className('mce-textbox'))
	// 			driver.executeScript("arguments[0].value = arguments[1];", targetElement, product.rycode);

	// 			driver.findElement(By.xpath('//*[@id="mce_46"]/button'))
	// 				.click();
	// 			// 賣家保固
	// 			driver.findElement(By.xpath('//*[@id="g_flag_3_select"]/option[2]'))
	// 				.click();
	// 			driver.findElement(By.xpath('//*[@id="g_flag_3"]'))
	// 				.click();
	// 			// 可開發票
	// 			driver.findElement(By.xpath('//*[@id="g_flag_6"]'))
	// 				.click();
	// 			// 海外運送
	// 			driver.findElement(By.xpath('//*[@id="g_flag_11"]'))
	// 				.click();
	// 			// 高雄市
	// 			driver.findElement(By.xpath('//*[@id="location_tw"]/option[17]'))
	// 				.click();

	// 			// 運送方式套用預設值
	// 			driver.findElement(By.xpath('//*[@id="main_form"]/div[5]/table/tbody/tr[1]/td/ul/li/label/input'))
	// 				.click();

	// 			driver.sleep(10000);

	// 			// 下一步
	// 			driver.findElement(By.css('input[value="下一步"]'))
	// 				.click();
	// 			driver.sleep(3000);

	// 			// 送出
	// 			driver.findElement(By.css('input[value="確認送出"]'))
	// 				.click();
	// 			driver.sleep(3000);

	// 			var rutenUrl = driver.findElement(By.css('div.rt-panel-inner td.text-left:nth-child(2) a'));
	// 			rutenUrl.getAttribute('href').then(function(href) {
	// 				googleSheet.writeIn("ruten", href, product);
	// 				callback();
	// 			});
	// 		}

	// 	],	function(err, res) {
	// 		if (err) throw err;
	// 		//googleSheet.writeIn("ruten", "rutendone", product);
	// 		//console.log(product.name+" 已上架至 Ruten...");
	// 	});
	// }

	function launchYahoo(product, callback) {

		console.log("----- ----- 目前上架平台：Yahoo! 拍賣 ----- -----");

		driver.get('https://tw.bid.yahoo.com/partner/merchandise/select_type?hpp=hp_auc_navigation_01');

		driver.wait(until.elementLocated(By.css('input[data-rapid_p="3"]'))).then((ele) => {
			driver.sleep(1000);
			ele.click();
		});

		// 分類
		driver.wait(until.elementLocated(By.css('input[value="1"]'))).then((ele) => {
			ele.click().then(() => {
				driver.wait(until.elementLocated(By.css('div.category-select-wrap>div:nth-child(1) select option:nth-child('+product.yahooA+')'))).then((ele) => {
					driver.sleep(1000);
					ele.click().then(() => {
						console.log("- 選擇分類「"+product.yahooA+"」。");
					//driver.executeScript("arguments[0].click()", ele).then(() => {
						driver.wait(until.elementLocated(By.css('div.category-select-wrap>div:nth-child(3) select option:nth-child('+product.yahooB+')'))).then((ele) => {
							driver.sleep(1000);
							ele.click().then(() => {
								console.log("- 選擇分類「"+product.yahooB+"」。");
							//driver.executeScript("arguments[0].click()", ele).then(() => {
								if (product.yahooB == 7) {
									driver.wait(until.elementLocated(By.css('div.category-select-wrap>div:nth-child(5) select option:nth-child('+product.yahooC+')'))).then((ele) => {
										driver.sleep(1000);
										ele.click();
										console.log("- 選擇分類「"+product.yahooC+"」。");
										//driver.executeScript("arguments[0].click()", ele);
									});
								}
							});
						});
					});
				});
			});
		});

		// 下一步
		driver.wait(until.elementLocated(By.css('input.button-submit'))).then((ele) => {
			ele.click();
		});

		// 先上傳圖片
		driver.wait(until.elementLocated(By.css('div.upload-image-wrap input[type="file"]'))).then((ele) => {
			console.log("準備上傳圖片 ...");
			ele.sendKeys(productDir+"image1.png").then(() => {
				driver.sleep(1500);
				driver.wait(until.elementLocated(By.css('div.upload-image-wrap input[type="file"]'))).then((ele) => {
					ele.sendKeys(productDir+"image2.png").then(() => {
						driver.sleep(1500);
						driver.wait(until.elementLocated(By.css('div.upload-image-wrap input[type="file"]'))).then((ele) => {
							ele.sendKeys(productDir+"image3.png");
						});
					});
				});
			});
			// console.log("- 上傳圖片。");
		});

		// 店家分類
		driver.wait(until.elementLocated(By.xpath('//*[@id="product"]/div/div[1]/fieldset/div[1]/div[2]/div/label/select/option[contains(text(), "☆注目商品☆")]'))).then((ele) => {
			ele.click();
			console.log("- 選擇店家分類「☆注目商品☆」。");
		});

		// 商品名稱
		driver.wait(until.elementLocated(By.css('input[name="itemTitle"]'))).then((ele) => {
			driver.executeScript("arguments[0].value = arguments[1]", ele, '【T'+product.yohotw+'】'+product.name+'《Ai-Tec》');
			console.log("- 填入商品名稱。");
		});

		// 商品數量
		driver.wait(until.elementLocated(By.xpath('//*[@id="totalQuantity"]'))).then((ele) => {
			ele.clear();
			driver.executeScript("arguments[0].value = arguments[1]", ele, 999);
		});

		// 商品價格
		driver.wait(until.elementLocated(By.xpath('//*[@id="salePrice"]'))).then((ele) => {
			driver.executeScript("arguments[0].value = arguments[1]", ele, product.price);
			console.log("- 填入商品價格。");
		});

		// Youtube 影片
		if (product.video !== 0) {
			driver.wait(until.elementLocated(By.xpath('//*[@id="videoSet"]'))).then((ele) => {
				ele.clear().then(() => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, "https://youtu.be/"+product.video);
				});
			});
		}

		// 原始碼
		driver.wait(until.elementLocated(By.xpath('//*[@id="literalMode"]'))).then((ele) => {
			ele.click().then(() => {
				driver.wait(until.elementLocated(By.css('textarea[name="itemDesc"]'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, product.rycode).then(() => {
						driver.wait(until.elementLocated(By.xpath('//*[@id="htmlMode"]'))).click();
						console.log("- 填入原始碼。");
						console.log("檢查圖片上傳情況 ...");
						checkImage();
					});
				});
			});
		});

		

		//https://s.yimg.com/ur/newauctions/img/transparent.gif
		//li.yui3-u:nth-child(1) .irens img
		function checkImage() {
			console.log("檢查圖片上傳進度... ")
			driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(1) .irens img'))).then((ele) => {
				ele.getAttribute('src').then((src) => {
					if (src.indexOf('transparent.gif') >= 0) {
						driver.sleep(1000);
						console.log("等待第 1 張圖片上傳 ...");
						checkImage();
					} else {
						// console.log("- 圖片上傳完成，即將上架商品。");
						// YahooLaunching();
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(1) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => {
								if (src.indexOf('transparent.gif') >= 0) {
									driver.sleep(1000);
									console.log("等待第 2 張圖片上傳 ...");
									checkImage();
								} else {
									driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(1) .irens img'))).then((ele) => {
										ele.getAttribute('src').then((src) => {
											if (src.indexOf('transparent.gif') >= 0) {
												driver.sleep(1000);
												console.log("等待第 3 張圖片上傳 ...");
												checkImage();
											} else {
												console.log("- 圖片上傳完成，即將上架商品。");
												YahooLaunching();
											}
										});
									});
								}
							});
						});
					}
				});
			});
		}

		function YahooLaunching() {
		
		//送出
			driver.wait(until.elementLocated(By.css('input[value="下一步"]'))).then((ele) => {
				driver.sleep(1500);
				ele.click().then(() => {
					driver.wait(until.elementLocated(By.css('input[value="送出"]'))).then((ele) => {
						driver.sleep(1000);
						ele.click().then(() => {
							driver.wait(until.elementLocated(By.css('span.value a'))).then((ele) => {
								ele.getAttribute('href').then((url) => {
									googleSheet.writeIn("yahoo", url, product, function() {
										driver.sleep(3000);
										callback();
									});
								});
							});
						});
					});
				});
			});
		}
	}
	// function launchYahoo(product, callback) {

	// 	async.series([

	// 		function startLaunch(step) {

	// 			driver.sleep(3000);

	// 			console.log("正在將商品 "+product.name+" 上架到 Yahoo...");

	// 			// 刊登頁面
	// 			driver.get('https://tw.bid.yahoo.com/partner/merchandise/select_type');
	// 			driver.findElement(By.css('input[data-rapid_p="3"]'))
	// 				.click();

	// 			// 選擇分類
	// 			// 分類第一項 div.category-select-wrap>div:nth-child(1) select option:nth-child(x)
	// 			// 分類第二項 div.category-select-wrap>div:nth-child(3) select option:nth-child(x)
	// 			// 分類第三項 div.category-select-wrap>div:nth-child(3) select option:nth-child(x)
	// 			driver.findElement(By.css('input[value="1"]'))
	// 			.click();
	// 			driver.findElement(By.css('div.category-select-wrap>div:nth-child(1) select option:nth-child('+product.yahooA+')'))
	// 			.click();
	// 			driver.sleep(1000);
	// 			driver.findElement(By.css('div.category-select-wrap>div:nth-child(3) select option:nth-child('+product.yahooB+')'))
	// 			.click();
	// 			(product.yahooB == 7) ? class3() : driver.sleep(1000);
	// 			function class3() {
	// 				driver.sleep(1000);
	// 				driver.findElement(By.css('div.category-select-wrap>div:nth-child(5) select option:nth-child('+product.yahooC+')'))
	// 					.click()
	// 			}
	// 			// 下一步
	// 			driver.findElement(By.css('input.button-submit'))
	// 				.click();
	// 			driver.sleep(3000);

	// 			// 店家分類
	// 			driver.findElement(By.css('select[name="customCategory"] option[value="60"]'))
	// 				.click();
	// 			// 商品名稱
	// 			driver.findElement(By.css('input[name="itemTitle"]'))
	// 				.sendKeys("【T"+product.yohotw+"】"+product.name+"《Ai-Tec》");

	// 			// 上傳圖片 div.upload-image-wrap input[type="file"]
	// 			driver.findElement(By.css('div.upload-image-wrap input[type="file"]'))
	// 				.sendKeys(productDir+"image1.png");
	// 			driver.sleep(3000);
	// 			driver.findElement(By.css('div.upload-image-wrap input[type="file"]'))
	// 				.sendKeys(productDir+"image2.png");	
	// 			driver.sleep(3000);
	// 			driver.findElement(By.css('div.upload-image-wrap input[type="file"]'))
	// 				.sendKeys(productDir+"image3.png");	
	// 			driver.sleep(3000);

	// 			// driver.findElement(By.css('div.specs-image-wrap.hidden input[type="file"]'))
	// 			// 	.sendKeys(productDir+"image1.png");
	// 			// driver.findElement(By.css('div.specs-image-wrap.hidden input[type="file"]'))
	// 			// 	.sendKeys(productDir+"image2.png");
	// 			// driver.findElement(By.css('div.specs-image-wrap.hidden input[type="file"]'))
	// 			// 	.sendKeys(productDir+"image3.png");

	// 			// 商品數量
	// 			driver.sleep(1000);
	// 			driver.findElement(By.xpath('//*[@id="totalQuantity"]'))
	// 				.clear();
	// 			driver.findElement(By.xpath('//*[@id="totalQuantity"]'))
	// 				.sendKeys("999");

	// 			// 商品價格
	// 			driver.sleep(1000);
	// 			driver.findElement(By.xpath('//*[@id="salePrice"]'))
	// 				.sendKeys(product.price);

	// 			if (product.video !== 0) {
	// 				product.video = "https://youtu.be/"+product.video;
	// 				driver.findElement(By.xpath('//*[@id="videoSet"]'))
	// 					.sendKeys(product.video);
	// 				driver.findElement(By.xpath('//*[@id="videoSet"]'))
	// 					.clear();
	// 				driver.findElement(By.xpath('//*[@id="videoSet"]'))
	// 					.sendKeys(product.video);
	// 			}

	// 			// 原始碼
	// 			driver.findElement(By.xpath('//*[@id="literalMode"]'))
	// 				.click();
	// 			// driver.findElement(By.css('textarea[name="itemDesc"]'))
	// 			// 	.sendKeys(product.rycode);

	// 			var targetElement = driver.findElement(By.css('textarea[name="itemDesc"]'));
	// 			driver.executeScript("arguments[0].value = arguments[1];", targetElement, product.rycode);

	// 			driver.findElement(By.xpath('//*[@id="htmlMode"]'))
	// 				.click();

	// 			// 下一頁
	// 			driver.findElement(By.css('input[value="下一步"]'))
	// 				.click();
	// 			driver.sleep(7000);
	// 			// 完成
	// 			driver.findElement(By.css('input[value="送出"]'))
	// 				.click();
	// 			driver.sleep(3000);

	// 			// 取得商品網址後寫入表單
	// 			/* 將 callback 與 writeIn 函式放在一個需等待的元素中，可以解決異步問題 */
	// 			var yahooUrl = driver.findElement(By.css('span.value a'));
	// 			yahooUrl.getAttribute('href').then(function(href) {
	// 				googleSheet.writeIn("yahoo", href, product);
	// 				callback();
	// 			});

	// 			driver.sleep(3000);
	// 		}

	// 	],	function(err, res) {
	// 		if (err) throw err;
	// 		//googleSheet.writeIn("yahoo", "yahoodone", product);
	// 		//console.log(product.name+" 已上架至 Yahoo...");
	// 	});
	// }

	function launchShopee(product, callback) {

		async.series([

			function startLaunch(step) {

				driver.sleep(3000);

				console.log("正在將商品 "+product.name+" 上架到 Shopee...");
				// 新增商品頁面
				driver.get('https://seller.shopee.tw/portal/product/new');
				// 上傳圖片
				//driver.sleep(3000);

				driver.wait(until.titleIs('新增商品 - 蝦皮賣家中心'), 5000).then(function() {
					console.log("Page loaded");
				});

				driver.findElement(By.css('input[type="file"]'))
					.sendKeys(productDir+"image1.png");
				driver.findElement(By.css('input[type="file"]'))
					.sendKeys(productDir+"image2.png");
				driver.findElement(By.css('input[type="file"]'))
					.sendKeys(productDir+"image3.png");
				// 商品名稱
				driver.findElement(By.css('form.ember-view div.container:nth-of-type(1) div.edit-row:nth-of-type(1) input'))
					.sendKeys("【T"+product.yohotw+"】"+product.name+"《Ai-Tec》");
				
				driver.findElement(By.css('div.shopee-textarea'))
					.click();
				driver.sleep(1000);
				// driver.findElement(By.css('div.shopee-textarea textarea'))
				// 	.sendKeys("&amp;#x1F680;");

				var targetElement = driver.findElement(By.css('div.shopee-textarea textarea'));
				driver.executeScript("arguments[0].value = arguments[1];", targetElement, product.spcode);

				// 商品類別 form.ember-view div.container:nth-of-type(1) div.edit-row:nth-of-type(3)
				driver.findElement(By.css('div.scs-label'))
					.click();
				driver.sleep(2000);
				driver.findElement(By.xpath('//div[8]/div'))
					.click();
				driver.sleep(2000);
				// 寫死為 3C
				driver.findElement(By.xpath('//div[2]/div[12]/div')).click();

				// 商品品牌
				driver.sleep(2000);
				driver.findElement(By.css('div#product-attributes input'))
					.sendKeys(product.brand);

				// 商品價格 form.ember-view div.container:nth-child(5) input[type="text"]
				driver.findElement(By.css('form.ember-view div.container:nth-child(5) input[type="text"]'))
					.sendKeys(product.price);

				// 商品數量 form.ember-view div.container:nth-child(5) input[type="number"]
				driver.findElement(By.css('form.ember-view div.container:nth-child(5) input[type="number"]'))
					.clear();
				driver.findElement(By.css('form.ember-view div.container:nth-child(5) input[type="number"]'))
					.sendKeys("999");

				// 備貨天數
				driver.findElement(By.css('div.preorder-radio-btns div:nth-child(2)'))
					.click();
				driver.sleep(2000);
				// driver.findElement(By.css('div.product-preorder-edit input'))
				// 	.sendKeys("7");

				// 儲存
				driver.findElement(By.css('div.btn-group div:nth-child(1)'))
					.click();
				driver.sleep(10000);

				// // 找出剛上架的產品
				// driver.findElement(By.css('div.product-items div.product-items__item:nth-of-type(2)'))
				// 	.click();

				driver.wait(until.titleIs('蝦皮賣家中心')).then(function() {
					// googleSheet.writeIn("shopee", "已上架", product);
					// callback();
					googleSheet.writeIn("shopee", '已上架', product, function() {
						driver.sleep(3000);
						callback();
					});

				});

				// // 連結回商品頁面
				// driver.sleep(5000);
				// driver.findElement(By.css('form div.container:nth-of-type(1) div.shopee-button--link'))
				// 	.click();
			}

		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("shopee", "shopppdone", product);
			//console.log(product.name+" 已上架至 Shopee...");
		});
	}

	function launchPCHome(product, callback) {
		async.series([

			function startLaunch(step) {

				driver.sleep(3000);

				console.log("正在將商品 "+product.name+" 上架到 PCHome...");
				// 新增商品頁面
				driver.get('https://cadm.pcstore.com.tw/prod/prod_nmod.htm');

				// 商品名稱

				ele = driver.wait(until.elementLocated(By.css('#c_prod_name')));
				ele.sendKeys("【T"+product.yohotw+"】"+product.name+"《Ai-Tec》");

				// driver.findElement(By.css('#c_prod_name'))
				// 	.sendKeys("【T"+product.yohotw+"】"+product.name+"《Ai-Tec》");

				// 分類
				driver.findElement(By.css('#exhL1 option:nth-child('+product.pchomeA+')'))
					.click();
				driver.sleep(2000);
				driver.findElement(By.css('#exhL2 option:nth-child('+product.pchomeB+')'))
					.click();
				driver.sleep(2000);
				if (!(isNaN(product.pchomeC))) {
					driver.findElement(By.css('#exhL3 option:nth-child('+product.pchomeC+')'))
					.click();
				}


				// testele = driver.findElement(By.css('#exhL1 option:nth-child('+product.pchomeA+')'));
				// driver.executeScript("arguments[0].click();", testele);
				// driver.sleep(2000);

				// testele = driver.findElement(By.css('#exhL2 option:nth-child('+product.pchomeB+')'));
				// driver.executeScript("arguments[0].click();", testele);
				// driver.sleep(2000);

				// if (!(isNaN(product.pchomeC))) {
				// 	testele = driver.findElement(By.css('#exhL2 option:nth-child('+product.pchomeB+')'));
				// 	driver.executeScript("arguments[0].click();", testele);
				// }


				// driver.findElement(By.css('#exhL1 option:nth-child('+product.pchomeA+')'))
				// 	.click();
				// driver.sleep(2000);
				// driver.findElement(By.css('#exhL2 option:nth-child('+product.pchomeB+')'))
				// 	.click();
				// driver.sleep(2000);
				// if (!(isNaN(product.pchomeC))) {
				// 	driver.findElement(By.css('#exhL3 option:nth-child('+product.pchomeC+')'))
				// 	.click();
				// }

				// 售價與確認售價
				driver.findElement(By.css('#c_prod_price'))
					.sendKeys(product.price);
				driver.findElement(By.css('#c_prod_price_chk'))
					.sendKeys(product.price);
				// 建議售價（市場價格）
				driver.findElement(By.css('#c_prod_price_sg'))
					.sendKeys(product.mprice);
				// 所在地
				driver.findElement(By.css('#c_prod_location'))
					.sendKeys("高雄市");

				// 數量
				driver.findElement(By.css('#specshell > div:nth-child(2) > input[type="text"]:nth-child(3)'))
					.sendKeys(499);

				// 簡介
				driver.findElement(By.css('#c_prod_intro_brief'))
					.sendKeys(product.intro);

				// 大圖　小圖
				driver.findElement(By.css('#c_big_img'))
					.sendKeys(productDir+"image1.png");
				// driver.findElement(By.css('#c_small_img'))
				// 	.sendKeys(productDir+"image2.png")

				// 原始碼
				var testele = driver.findElement(By.css('#mceu_27-open'));
				driver.executeScript("arguments[0].click();", testele);

				driver.sleep(1000);
				testele = driver.findElement(By.css('span.mce-text'));
				driver.executeScript("arguments[0].click();", testele);

				testele = driver.findElement(By.css('textarea.mce-textbox'));
				driver.executeScript("arguments[0].value = arguments[1];", testele, product.rycode);

				testele = driver.findElement(By.css('div.mce-abs-layout-item.mce-first button'));
				driver.executeScript("arguments[0].click();", testele);

				// 送出
				testele = driver.findElement(By.css('input[value="填好送出"]'));
				driver.executeScript("arguments[0].click();", testele);

				// 信用卡確認（之後可移除）
				//testele = driver.findElement(By.css('div#aa'));
				//driver.executeScript("arguments[0].click();", testele);

				driver.sleep(3000);

				driver.wait(until.elementLocated(By.css('tbody tr:nth-child(2) a')));

				var pchomeUrl = driver.findElement(By.css('tbody tr:nth-child(2) a'));
				pchomeUrl.getAttribute('href').then(function(href) {
					googleSheet.writeIn("pchome", href, product, function() {
						driver.sleep(3000);
						callback();
					});
				});

			}

		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("shopee", "shopppdone", product);
			//console.log(product.name+" 已上架至 Shopee...");
		});
	}

	function createStorage(product, callback) {
		async.series([

			function starCreate(step) {

				driver.sleep(3000);

				console.log("正在將商品 "+product.name+" 建立庫存頁面...");
				// 新增商品頁面
				driver.get('https://ec.mallbic.com/Module/2_Good/Good_Entry.aspx');

				driver.sleep(3000);

				// 新增商品
				driver.findElement(By.css('li[title="新增商品"]'))
					.click();

				driver.sleep(3000);
				// 商品編號
				driver.findElement(By.css('#txt_good_id > input'))
					.sendKeys("T"+product.yohotw);

				// 商品名稱
				driver.findElement(By.css('#txt_good_name > input'))
					.sendKeys(product.name)

				// 新增按鈕
				driver.findElement(By.css('#add_style'))
					.click();

				driver.sleep(1000);
				//#dlg_modify_good__7 table.export_table tbody tr:nth-child(1) td:nth-child(4)
				// 樣式、尺寸
				driver.findElement(By.xpath('//*[@id="dlg_modify_good"]/div[4]/table/tbody/tr[1]/td[4]/input'))
					.sendKeys("F");
				driver.findElement(By.xpath('//*[@id="dlg_modify_good"]/div[4]/table/tbody/tr[1]/td[5]/input'))
					.sendKeys("F");

				// 可用庫存
				driver.findElement(By.xpath('//*[@id="dlg_modify_good"]/div[4]/table/tbody/tr[1]/td[6]/input'))
					.sendKeys("0");

				// 售價
				driver.findElement(By.xpath('//*[@id="dlg_modify_good"]/div[4]/table/tbody/tr[1]/td[10]/input'))
					.sendKeys(product.price);

				// 成本
				driver.findElement(By.xpath('//*[@id="dlg_modify_good"]/div[4]/table/tbody/tr[1]/td[14]/input'))
					.sendKeys(product.cost);

				// 儲存
				//driver.findElement(By.css('#btn_save')).click();
				testele = driver.findElement(By.css('#btn_save'));
				driver.executeScript("arguments[0].click();", testele);

				driver.sleep(2000);
				// 關閉頁面
				//testele = driver.findElement(By.css('#dlg_modify_good__7 span.btn_close_m'));
				//driver.executeScript("arguments[0].click();", testele);

				var mallbicUrl = driver.findElement(By.css('tbody tr.bc_even:nth-child(2)'));
				mallbicUrl.getAttribute('class').then(function() {
					// googleSheet.writeIn("storage", "1", product);
					// callback();
					googleSheet.writeIn("storage", "1", product, function() {
						driver.sleep(3000);
						callback();
					});
				});

			}

		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("shopee", "shopppdone", product);
			//console.log(product.name+" 已上架至 Shopee...");
		});
	}

}
