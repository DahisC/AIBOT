var async = require('async');
var rimraf = require('rimraf');
var request = require('request');
var fs = require('fs');

var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;

var chrome = require('selenium-webdriver/chrome');

// configure browser options ...
var options = new chrome.Options()
	options.addArguments("user-data-dir=D:/Bot/Default");
	//options.addArguments("user-data-dir=C:/Users/khpr/AppData/Local/Google/Chrome/User Data/Default");

var googleSheet = require('./googleSheet.js');

//
var productDir = "D:/AIBOT/image/";

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
	console.log(_product);

	var time = new Date();
	var now = (time.getMonth()+1)+"/"+time.getDate()+" "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();

	var driver = new webdriver.Builder()
		.forBrowser('chrome')
		.setChromeOptions(options)
		.build();

	driver.manage().window().maximize();

	checkAnyspecs();

	function checkAnyspecs() {
		(product.anyspecs == "") ? launchAnyspecs(product, function() { 
			checkYohoTW(); 
			googleSheet.writeIn("anyspecs", "*", product); }) : checkYohoTW();
	}

	function checkYohoTW() {
		(product.yohotw == "") ? launchYohoTW(product, function() {
			checkRuten();
			googleSheet.writeIn("yohotw", product.yohotw, product); }) : checkRuten();
	}

	function checkRuten() {
		(product.ruten == "") ? launchRuten(product, function() {
			checkYahoo();
			googleSheet.writeIn("ruten", "*", product); }) : checkYahoo();
	}

	function checkYahoo() {
		(product.yahoo == "") ? launchYahoo(product, function() {
			checkShopee();
			googleSheet.writeIn("yahoo", "*", product); }) : checkShopee();
	}

	function checkShopee() {
		(product.shopee == "") ? launchShopee(product, function() {
			completeLaunch();
			googleSheet.writeIn("shopee", "*", product); }) : completeLaunch();
	}

	function completeLaunch() {
		googleSheet.writeIn("launched", "*", product);
	}

	function launchAnyspecs(product, callback) {

		async.series([

			function startLaunch(step) {

				// 上架按鈕
				driver.get("https://www.anyspecs.com/product/create");
				// 商品名稱
				driver.findElement(By.xpath('/html/body/div[1]/form/div[2]/div[2]/span/input')).sendKeys(product.name);
				// 商品描述
				driver.findElement(By.xpath('/html/body/div[1]/form/div[3]/div[2]/span/textarea')).sendKeys(product.intro);
				// 原始碼
				driver.findElement(By.xpath('//*[@id="mceu_8"]/button/i')).click();
				driver.findElement(By.className('mce-textbox')).clear();
				driver.findElement(By.className('mce-textbox')).sendKeys(product.code)
				//let js = 'var q=document.getElementById("mceu_23");q.innerText="'+product.code+'"';
				driver.findElement(By.xpath('//*[@id="mceu_25"]/button')).click();
				// 商品價格
				var hkprice = product.price/4;
				driver.findElement(By.xpath('/html/body/div[1]/form/div[5]/div[2]/div[2]/input')).sendKeys(hkprice);

				callback();
				//step();
				//step();
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

				// 上架頁面
				driver.get("https://www.taiwanyoho.com/x/goods.php?act=add");
				// 商品名稱
				driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[1]/td[2]/span[1]/input'))
					.sendKeys(product.name);

				// 選擇分類
				driver.findElement(By.css('select[name="cat_id"] option[value="171"]'))
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
				driver.sleep(10000)
// 確定按鈕（確定後即上架產品）
				// driver.findElement(By.xpath('//*[@id="tabbody-div"]/form/div/input[2]'))
				// 	.click();

				// 回產品列表
				driver.findElement(By.xpath('/html/body/h1/span[1]/a'))
					.click();

				// 回產品編輯頁
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
					console.log(product.yohotw);
					/* 在此處莫名其妙解決了 callback 會異步執行的問題，成功帶回產品編號 */
					callback();
					//step();
				});
			}	


		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("yohotw", "twdone", product);
			//console.log(product.name+" 已上架至 Anyspecs...");
		});
	}

	function launchRuten(product, callback) {

		async.series([

			function startLaunch(step) {
				
				driver.get('https://mybidu.ruten.com.tw/upload/step1.htm');
				driver.findElement(By.xpath('/html/body/div/div[3]/div/div/a[1]/span'))
					.click();

				// 商品分類
				driver.sleep(1000);
				driver.findElement(By.css('ul.class-path-node-list li[rt-class-id="'+product.rutenA+'"]'))
					.click();
				driver.sleep(2000);
				driver.findElement(By.css('ul.class-path-node-list li[rt-class-id="'+product.rutenB+'"]'))
					.click();

				// 插入圖片
				driver.findElement(By.xpath('//*[@id="image_uploader"]/div/div[1]/div/label[1]/input'))
					.sendKeys(productDir+"image1.png");
				driver.findElement(By.xpath('//*[@id="image_uploader"]/div/div[1]/div/label[1]/input'))
					.sendKeys(productDir+"image2.png");
				driver.findElement(By.xpath('//*[@id="image_uploader"]/div/div[1]/div/label[1]/input'))
					.sendKeys(productDir+"image3.png");

				// 商品名稱
				driver.findElement(By.xpath('//*[@id="g_name"]'))
					.sendKeys("【T"+product.yohotw+"】"+product.name+"《Ai-Tec》");
				// 商品價格
				driver.findElement(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[3]/td/div[1]/label/input'))
					.sendKeys(product.price);
				// 商品數量
				driver.findElement(By.xpath('//*[@id="show_num"]'))
					.sendKeys("999");
				// 自用料號
				driver.findElement(By.xpath('//*[@id="goods_no"]'))
					.sendKeys("T"+product.yohotw);
				// Youtube 影片
				driver.findElement(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[10]/td/input'))
					.sendKeys(product.video);
				// 原始碼
				driver.findElement(By.xpath('//*[@id="mce_7"]/button/i'))
					.click();
				driver.findElement(By.className('mce-textbox'))
					.sendKeys(product.rycode);
				driver.findElement(By.xpath('//*[@id="mce_46"]/button'))
					.click();
				// 賣家保固
				driver.findElement(By.xpath('//*[@id="g_flag_3_select"]/option[2]'))
					.click();
				driver.findElement(By.xpath('//*[@id="g_flag_3"]'))
					.click();
				// 可開發票
				driver.findElement(By.xpath('//*[@id="g_flag_6"]'))
					.click();
				// 海外運送
				driver.findElement(By.xpath('//*[@id="g_flag_11"]'))
					.click();
				// 高雄市
				driver.findElement(By.xpath('//*[@id="location_tw"]/option[17]'))
					.click();

				callback();
				//step();
				
			}

		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("ruten", "rutendone", product);
			//console.log(product.name+" 已上架至 Ruten...");
		});
	}

	function launchYahoo(product, callback) {

		async.series([

			function startLaunch(step) {

				callback();
				//step();
			}

		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("yahoo", "yahoodone", product);
			//console.log(product.name+" 已上架至 Yahoo...");
		});
	}

	function launchShopee(product, callback) {

		async.series([

			function startLaunch(step) {

				// 新增商品頁面
				driver.get('https://seller.shopee.tw/portal/product/new');
				// 上傳圖片
				driver.sleep(3000);
				driver.findElement(By.css('#ember2925 > input[type="file"]'))
					.sendKeys(productDir+"image1.png");
				driver.findElement(By.css('#ember2925 > input[type="file"]'))
					.sendKeys(productDir+"image2.png");
				driver.findElement(By.css('#ember2925 > input[type="file"]'))
					.sendKeys(productDir+"image3.png");
				// 商品名稱
				driver.findElement(By.xpath('//*[@id="ember3210"]'))
					.sendKeys(product.name);
				//

				callback();
				//step();
			}

		],	function(err, res) {
			if (err) throw err;
			//googleSheet.writeIn("shopee", "shopppdone", product);
			//console.log(product.name+" 已上架至 Shopee...");
		});
	}


}

// function launchAnyspecs(product, cbstep) {

// 	async.series([

// 		function startLaunch(step) {

// 			var driver = new webdriver.Builder()
// 				.forBrowser('chrome')
// 				.setChromeOptions(options)
// 				.build();

// 			driver.manage().window().maximize();

// 			// 上架按鈕
// 			driver.get("https://www.anyspecs.com/product/create");
// 			// 商品名稱
// 			driver.findElement(By.xpath('/html/body/div[1]/form/div[2]/div[2]/span/input')).sendKeys(product.name);
// 			// 商品描述
// 			driver.findElement(By.xpath('/html/body/div[1]/form/div[3]/div[2]/span/textarea')).sendKeys(product.intro);
// 			// 原始碼
// 			driver.findElement(By.xpath('//*[@id="mceu_8"]/button/i')).click();
// 			driver.findElement(By.className('mce-textbox')).clear();
// 			driver.findElement(By.className('mce-textbox')).sendKeys(product.rycode);
// 			driver.findElement(By.xpath('//*[@id="mceu_25"]/button')).click();
// 			// 商品價格
// 			var hkprice = product.price/4;
// 			driver.findElement(By.xpath('/html/body/div[1]/form/div[5]/div[2]/div[2]/input')).sendKeys(hkprice);
// 			// 關閉瀏覽器
// 			driver.quit();

// 			step();
// 		}

// 	],	function(err, res) {
// 		if (err) throw err;
// 		googleSheet.writeIn("anyspecs", "anydone", product);
// 		//console.log(product.name+" 已上架至 Anyspecs...");
// 		cbstep();
// 	});
// }

// function launchYohoTW(product, cbstep) {

// 	async.series([

// 		function startLaunch(step) {

// 			var driver = new webdriver.Builder()
// 				.forBrowser('chrome')
// 				.setChromeOptions(options)
// 				.build();

// 			driver.manage().window().maximize();


// 			// 上架頁面
// 			driver.get("https://www.taiwanyoho.com/x/goods.php?act=add");
// 			// 商品名稱
// 			driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[1]/td[2]/span[1]/input'))
// 				.sendKeys(product.name);
// 			// 商品價格
// 			driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[6]/td[2]/input[1]'))
// 				.clear();
// 			driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[6]/td[2]/input[1]'))
// 				.sendKeys(product.price);
// 			// 商品圖片
// 			driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[11]/td[2]/div/input'))
// 				.sendKeys(productDir+"image1.png");

// 			step();
// 		},

// 	],	function(err, res) {
// 		if (err) throw err;
// 		googleSheet.writeIn("yohotw", "twdone", product);
// 		//console.log(product.name+" 已上架至 Anyspecs...");
// 		cbstep();
// 	});
// }

// function launchRuten(product, cbstep) {

// 	async.series([

// 		function startLaunch(step) {
// 			step();
// 		}

// 	],	function(err, res) {
// 		if (err) throw err;
// 		googleSheet.writeIn("ruten", "rutendone", product);
// 		//console.log(product.name+" 已上架至 Ruten...");
// 		cbstep();
// 	});
// }

// function launchYahoo(product, cbstep) {

// 	async.series([

// 		function startLaunch(step) {
// 			step();
// 		}

// 	],	function(err, res) {
// 		if (err) throw err;
// 		googleSheet.writeIn("yahoo", "yahoodone", product);
// 		//console.log(product.name+" 已上架至 Yahoo...");
// 		cbstep();
// 	});
// }

// function launchShopee(product, cbstep) {

// 	async.series([

// 		function startLaunch(step) {
// 			step();
// 		}

// 	],	function(err, res) {
// 		if (err) throw err;
// 		googleSheet.writeIn("shopee", "shopppdone", product);
// 		//console.log(product.name+" 已上架至 Shopee...");
// 		cbstep();
// 	});
// }
