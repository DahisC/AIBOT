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
				//console.log('Loaded doc: '+info.title+' by '+info.author.email);
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
				//console.log('Loaded doc: '+info.title+' by '+info.author.email);
				sheet = info.worksheets[0];
				step();
			});
		},

		function workingWithCells(step) {

			(header == 'launched') ? col = 1 : '';
			(header == 'yohotw') ? col = 2 : '';
			(header == 'ruten') ? col = 3 : '';
			(header == 'yahoo') ? col = 4 : '';
			(header == 'shopee') ? col = 5 : '';
			(header == 'pchome') ? col = 6 : '';

			//console.log(header);
			//console.log(col);

			sheet.getCells({
				'min-row': i,
				'max-row': i,
				'min-col': col,
				'max-col': col,
				'return-empty': true
			},	function(err, cells) {
				var cell = cells[0];
				var formula = '=HYPERLINK("'+url+'","商品頁面")';
				if (header == 'launched') {
					formula = url;
					console.log("----------- 商品上架完畢 -----------");
				}
				console.log("----- ----- 平台上架成功，儲存上架紀錄！ ----- -----");
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
		if (rows[i].launched == '' && rows[i].islive == '正常供貨' && rows[i].classc != '遺珠') {
			startLaunch();
			// func StartLaunch();
		} else {
			console.log("產品 "+rows[i].name+" 無法上架或已上架");
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

			//console.log(rows[i]);

			const cls = rows[i].classb;

			var warrantyCode = '<div id="AITB_warranty" class="col-md-12" style="font-family: &quot;Microsoft YaHei&quot;;"><img src="http://imageshack.com/a/img834/9688/4w7v.png" style="width: 100%; font-family: &quot;Microsoft YaHei&quot;; margin-top: 20px; margin-bottom: 20px;"><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">本產品自海外直接進口，本店提供 3 個月免費保固，期間非人為損傷可直接替換新品或免費送修。</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">可開立發票與統編。</p><hr></div>';
			var statementCode = '<hr><div id="AITB_statment" class="col-md-12" style="font-family: &quot;Microsoft YaHei&quot;;"><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;">下標前叮嚀</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">因為庫存狀況不一，請您於下標前先參照「關於我」以及於問與答中確認是否還有商品庫存。</p><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;"> 寄送時間 </p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">現貨商品將於下標結帳後，宅配或超商寄出。約於下標後 2 天內寄出，3-4 天內抵達。</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">若為預購商品，等候時間以本店公布時間為準；到貨後可能會自台灣或海外直接寄出予買家。</p><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;">退貨或換貨</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">若商品於到貨後本身有瑕疵（非人為因素造成之損傷或損壞），我們將受理退貨或換新品之要求。</p><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;">商品猶豫期</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">商品到貨後七天內您享有商品猶豫期（非試用期），但只限於商品包裝保持未拆封且未使用的情況下。</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">若您於期間內決定不購買，可將商品寄回，我們會在收到商品並確認後將款項退回。若已經拆封、使用，本店將視情況酌收整新處理費。</p></div>';

			var notSourceCode = warrantyCode + rows[i].sourcecode + statementCode;

			var aiClass;
			var rutenClass1;
			var rutenClass2;
			var rutenClass3 = 'None';

			var yahooClass1;
			var yahooClass2;
			var yahooClass3 = 'None';

			console.log(cls);

			if (cls == '手機及配件') {
				rutenClass1 = "手機、通訊";
				rutenClass2 = "代買、海外代購";
				rutenClass3 = "手機代購"

				yahooClass1 = "手機、配件與通訊";
				yahooClass2 = "其他";
				//
			} else if (cls == '休閑娛樂') {
				rutenClass1 = "家電、影音周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "家電與影音視聽";
				yahooClass2 = "影音/視聽/MP3";
				yahooClass3 = "其他影音設備";
				//
			} else if (cls == '穿戴式裝置') {
				rutenClass1 = "電腦、電子、周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "電腦、平板與周邊";
				yahooClass2 = "其他";
				//
			} else if (cls == '數碼影像') {
				rutenClass1 = "相機、攝影機";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "相機、攝影與周邊";
				yahooClass2 = "其他";
				//
			} else if (rows[i].classa == '美容及護理') {
				rutenClass1 = "保養、彩妝";
				rutenClass2 = "國際代購/代買";

				yahooClass1 = "美容保養與彩妝";
				yahooClass2 = "其他";
				//
			} else if (cls == '大型家電' || cls == '生活電器' || cls == '廚房電器') {
				rutenClass1 = "家電、影音周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "家電與影音視聽";
				yahooClass2 = "影音/視聽/MP3";
				yahooClass3 = "其他影音設備";
				if (cls == '生活電器') {
					yahooClass2 = "生活家電";
					yahooClass3 = "其他生活家電";
				} else if (cls == '廚房電器') {
					yahooClass2 = "廚房家電";
					yahooClass3 = "其他調理電器";
				}
				//
			//} else if (cls == '電腦' || '電腦週邊' || '網絡' || '儲存' || '打印' || '組件' || '電競') {
			} else if (rows[i].classa == '電腦') {
				rutenClass1 = "電腦、電子、周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "電腦、平板與周邊";
				yahooClass2 = "其他";
				//
			} else if (cls == '汽車用品') {
				rutenClass1 = "電腦、電子、周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "電腦、平板與周邊";
				yahooClass2 = "其他";
				//
			} else if (cls == '母嬰' || cls == '兒童') {
				rutenClass1 = "嬰幼童、母親";
				rutenClass2 = "國際代購/代買";

				yahooClass1 = "嬰幼兒與孕婦";
				yahooClass2 = "其他";
				//
			} else if (cls == '運動' || cls == '旅行用品' || cls == '戶外') {
				rutenClass1 = "運動、健身";
				rutenClass2 = "國際代購/代買";

				yahooClass1 = "運動、戶外與休閒";
				yahooClass2 = "其他";
				//
			} else if (cls == '生活用品') {
				rutenClass1 = "生活、居家";
				rutenClass2 = "國際代購/代買";

				yahooClass1 = "居家、家具與園藝";
				yahooClass2 = "其他";
				//
			} else {
				rutenClass1 = "電腦、電子、周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "電腦、平板與周邊";
				yahooClass2 = "其他";
			}

			checkYohoTW();

			function checkYohoTW() {
				(rows[i].yohotw == "") ? launchYoho(function() { checkRuten(); }) : checkRuten();
			}

			function checkRuten() {
				(rows[i].ruten == "") ? launchRuten(function() { checkYahoo(); }) : checkYahoo();
			}

			function checkYahoo() {
				(rows[i].yahoo == "") ? launchYahoo(function() { checkShopee(); }) : checkShopee();
			}

			function checkShopee() {
				(rows[i].shopee == "") ? launchShopee(function() { launchDone(); }) : launchDone();
			}

			function launchDone() {
				var timeStamp = getTime();
				writeInSheet(i+2, "launched", timeStamp, function() {
					driver.sleep(3000);
					driver.quit();
					i++;
					prepareLaunch(rows, i);
				});
			}

			function getTime() {
				var time = new Date();
				var now = (time.getMonth()+1)+"/"+time.getDate()+" "+time.getHours()+":"+time.getMinutes()+":"+time.getSeconds();
				return now;
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



			// if (class == '') {
			// 	rutenClass1 = "電腦、電子、周邊";
			// 	yahooClass1 = "電腦、平板與周邊";
			// } else if (class == '手機及配件') {
			// 	const rutenClass1 = "手機、通訊";
			// 	const yahooClass1 = "手機、配件與通訊";
			// } else if (class == '數碼影像') {
			// 	const rutenClass1 = "相機、攝影機";
			// 	const yahooClass1 = "相機、攝影與周邊";
			// } else if (class == '休閑娛樂') {
			// 	const rutenClass1 = "家電、影音周邊";
			// 	const yahooClass1 = "家電與影音視聽";
			// } else if (class == '') {
			// 	const rutenClass1 = "電玩、遊戲";
			// 	const yahooClass1 = "電玩遊戲與主機";
			// } else if (rows[i].classa == '美容及護理') {
			// 	const rutenClass1 = "保養、彩妝";
			// 	const yahooClass1 = "美容保養與彩妝";
			// } else if (rows[i].classb == '母嬰' || rows[i].classb == '兒童') {
			// 	const rutenClass1 = "嬰幼童、母親";
			// 	const yahooClass1 = "嬰幼兒與孕婦";
			// } else if (rows[i]. == '') {
			// 	const const rutenClass1 = "運動、健身";
			// 	const yahooClass1 = "運動、戶外與休閒";
			// } else if (rows[i]. == '') {
			// 	const rutenClass1 = "休閒、旅遊";
			// 	const yahooClass1 = "運動、戶外與休閒";
			// } else if (rows[i]. == '') {
			// 	const rutenClass1 = "生活、居家";
			// 	const yahooClass1 = "居家、家具與園藝";
			// } else if (rows[i]. == '') {
			// 	const rutenClass1 = "玩具、公仔";
			// 	const yahooClass1 = "玩具、模型與公仔";
			// } else if (rows[i]. == '') {
			// 	const rutenClass1 = "";
			// 	const yahooClass1 = "";
			// } else {

			// }


			// 友和台灣上架
			function launchYoho(callback) {

				console.log("----- ----- 目前上架平台：友和台灣 ----- -----");

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
						console.log("- 找不到品牌，新增「"+rows[i].brand+"」品牌。");
						driver.sleep(1000);
						driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[4]/td[2]/select/option[contains(text(), "'+rows[i].brand+'")]')).then((ele) => {
							ele.click();
							console.log("- 成功，重新選擇品牌"+rows[i].brand+"！");
						});
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
						writeInSheet(i+2, 'yohotw', url, function() {
							driver.sleep(3000);
							callback();
						});
					});
				});
			} // func launchYoho

			function launchRuten(callback) {

				console.log("----- ----- 目前上架平台：露天拍賣 ----- -----");
				
				// 上架頁面
				driver.get('https://mybidu.ruten.com.tw/upload/step1.htm');

				// 選擇上架方式
				driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div > div > a.rt-upload-tool-item.rt-upload-tool-oneitem > span'))).then((ele) => {
					ele.click();
				});

				//上傳圖片
				driver.wait(until.elementLocated(By.css('#image_uploader > div > div.tool-bar.hint > div > label.action > input'))).then((ele) => {
					ele.sendKeys(productDir+"image1.png");
					console.log("- 上傳圖片");
				});

				// 分類
				driver.wait(until.elementLocated(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(), "'+rutenClass1+'")]'))).then((ele) => {
					driver.sleep(1000);
					//ele.click().then(() => {
					driver.executeScript("arguments[0].click()", ele).then(() => {
						console.log("- 選擇分類「"+rutenClass1+"」。");
						driver.wait(until.elementLocated(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(), "'+rutenClass2+'")]'))).then((ele) => {
							driver.sleep(1000);
							//ele.click().then(() => {
							driver.executeScript("arguments[0].click()", ele).then(() => {
								console.log("- 選擇分類「"+rutenClass2+"」。");
								if (rutenClass3 != 'None') {
									driver.wait(until.elementLocated(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(), "'+rutenClass3+'")]'))).then((ele) => {
										driver.sleep(1000);
										driver.executeScript("arguments[0].click()", ele);
										console.log("- 選擇分類「"+rutenClass3+"」。");
									});
								}
							});
						});
					});
				});

				//driver.sleep(10000);

				// 商品名稱
				driver.wait(until.elementLocated(By.css('#g_name'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, '【'+rows[i].num+'】'+rows[i].name+'【Ai-Tec】');
					console.log("- 填入商品名稱"+rows[i].name+"。");
				});

				// 店家分類
				driver.wait(until.elementLocated(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[2]/td/select/option[contains(text(), "☆注目商品☆")]'))).then((ele) => {
					ele.click();
					console.log("- 選擇店家分類「☆注目商品☆」。");
				});

				// 商品價格
				driver.wait(until.elementLocated(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[3]/td/div[1]/label/input'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, rows[i].price).then(() => {
						console.log("- 填入商品價格「"+rows[i].price+"」。");
						// 商品數量
						driver.wait(until.elementLocated(By.xpath('//*[@id="show_num"]'))).then((ele) => {
							driver.executeScript("arguments[0].value = arguments[1]", ele, 999);
						});
					});
				});

				// 原始碼
				driver.wait(until.elementLocated(By.css('#mce_7 > button > i'))).then((ele) => {
					driver.sleep(1000);
					ele.click().then(() => {
						driver.wait(until.elementLocated(By.className('mce-textbox'))).then((ele) => {
							driver.executeScript("arguments[0].value = arguments[1]", ele, notSourceCode).then(() => {
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
				
				function checkImage() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-child(1) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片上傳完成，即將上架商品。");
								driver.sleep(1000);
								RutenLaunching();
							} else {
								driver.sleep(1000);
								checkImage();
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
												writeInSheet(i+2, 'ruten', url, function() {
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
				
				// 下一步
				// driver.wait(until.elementLocated(By.css('#main_form > div.text-center.form-submit-button-wrap > input.rt-button.rt-button-submit.item-upload-submit'))).then((ele) => {
				// 	ele.click().then(() => {
				// 		driver.wait(until.elementLocated(By.css('input[value="確認送出"]'))).then((ele) => {
				// 			ele.click().then(() => {
				// 				driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div.rt-text-large.item-upload-result > span'))).then((ele) => {
				// 					driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div.rt-panel.rt-panel-bg.item-finish > div > table > tbody > tr:nth-child(2) > td.text-left > a'))).then((ele) => {
				// 						ele.getAttribute('href').then((url) => {
				// 							writeInSheet(i+2, 'ruten', url, function() {
				// 								driver.sleep(3000);
				// 								callback();
				// 							});
				// 						});
				// 					});
				// 				});
				// 			});
				// 		});
				// 	});
				// });



			}

			function launchYahoo(callback) {

				console.log("----- ----- 目前上架平台：Yahoo! 拍賣 ----- -----");

				driver.get('https://tw.bid.yahoo.com/partner/merchandise/select_type?hpp=hp_auc_navigation_01');

				driver.wait(until.elementLocated(By.css('input[data-rapid_p="3"]'))).then((ele) => {
					driver.sleep(1000);
					ele.click();
				});

				// 分類
				driver.wait(until.elementLocated(By.css('input[value="1"]'))).then((ele) => {
					ele.click().then(() => {
						driver.wait(until.elementLocated(By.xpath('//*[@id="bd"]/div[2]/div/div[1]/form/fieldset[2]/ul[2]/li[1]/div/div[1]/select/option[contains(text(), "'+yahooClass1+'")]'))).then((ele) => {
							driver.sleep(1000);
							ele.click().then(() => {
								console.log("- 選擇分類「"+yahooClass1+"」。");
							//driver.executeScript("arguments[0].click()", ele).then(() => {
								driver.wait(until.elementLocated(By.xpath('//*[@id="bd"]/div[2]/div/div[1]/form/fieldset[2]/ul[2]/li[1]/div/div[3]/select/option[contains(text(), "'+yahooClass2+'")]'))).then((ele) => {
									driver.sleep(1000);
									ele.click().then(() => {
										console.log("- 選擇分類「"+yahooClass2+"」。");
									//driver.executeScript("arguments[0].click()", ele).then(() => {
										if (yahooClass3 != 'None') {
											driver.wait(until.elementLocated(By.xpath('//*[@id="bd"]/div[2]/div/div[1]/form/fieldset[2]/ul[2]/li[1]/div/div[5]/select/option[contains(text(), "'+yahooClass3+'")]'))).then((ele) => {
												driver.sleep(1000);
												ele.click();
												console.log("- 選擇分類「"+yahooClass3+"」。");
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
					ele.sendKeys(productDir+"image1.png");
					console.log("- 上傳圖片。");
				});

				// 店家分類
				driver.wait(until.elementLocated(By.xpath('//*[@id="product"]/div/div[1]/fieldset/div[1]/div[2]/div/label/select/option[contains(text(), "☆注目商品☆")]'))).then((ele) => {
					ele.click();
					console.log("- 選擇店家分類「☆注目商品☆」。");
				});

				// 商品名稱
				driver.wait(until.elementLocated(By.css('input[name="itemTitle"]'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, '【'+rows[i].num+'】'+rows[i].name+'【Ai-Tec】');
					console.log("- 填入商品名稱。");
				});

				// 商品數量
				driver.wait(until.elementLocated(By.xpath('//*[@id="totalQuantity"]'))).then((ele) => {
					ele.clear();
					driver.executeScript("arguments[0].value = arguments[1]", ele, 999);
				});

				// 商品價格
				driver.wait(until.elementLocated(By.xpath('//*[@id="salePrice"]'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, rows[i].price);
					console.log("- 填入商品價格。");
				});


				// 原始碼
				driver.wait(until.elementLocated(By.xpath('//*[@id="literalMode"]'))).then((ele) => {
					ele.click().then(() => {
						driver.wait(until.elementLocated(By.css('textarea[name="itemDesc"]'))).then((ele) => {
							driver.executeScript("arguments[0].value = arguments[1]", ele, notSourceCode).then(() => {
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
					driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(1) .irens img'))).then((ele) => {
						ele.getAttribute('src').then((src) => {
							if (src.indexOf('transparent.gif') >= 0) {
								driver.sleep(1000);
								checkImage();
							} else {
								console.log("- 圖片上傳完成，即將上架商品。");
								YahooLaunching();
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
											writeInSheet(i+2, 'yahoo', url, function() {
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
				


				//callback();
			}

			function launchShopee(callback) {

				console.log("----- ----- 目前上架平台：蝦皮 拍賣 ----- -----");

				driver.get('https://seller.shopee.tw/portal/product/list/all');

				driver.wait(until.elementLocated(By.css('.button'))).then((ele) => {
					ele.click();
				});

				// 上傳圖片
				driver.wait(until.elementLocated(By.css('input[type="file"]'))).then((ele) => {
					ele.sendKeys(productDir+"image1.png");
				});

				// 商品名稱
				driver.wait(until.elementLocated(By.xpath('//*[@id="shopee-powerseller-root"]/div/div[3]/form/div[1]/div[1]/div[2]/div[1]/div[2]/input'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, '【'+rows[i].num+'】'+rows[i].name+'【Ai-Tec】');
				});

			} // func launchShopee

		} // func launchProduct
	} // func startLaunch
} // func prepareLaunch
