var async = require('async');
var rimraf = require('rimraf');
var request = require('request');
var fs = require('fs');
var Jimp = require("jimp");

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
var productDir = "/Users/Dahis/Desktop/AIBOT/AITEC/img/";
/* ------------------------------------------------------------------------------------------------ */

exports.start = function() {
	getSheet();
}

function getSheet() {

	var GoogleSpreadsheet = require('google-spreadsheet');
	var async = require('async');

	var doc = new GoogleSpreadsheet('1cBJF53lLss0iKBmmrP_StjMjwvh4V2fsziCtIasvEu0');
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

	var doc = new GoogleSpreadsheet('1cBJF53lLss0iKBmmrP_StjMjwvh4V2fsziCtIasvEu0');
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

			(header == 'launched') ? col = 23 : '';
			(header == 'ruten') ? col = 24 : '';
			(header == 'yahoo') ? col = 25 : '';
			(header == 'shopee') ? col = 26 : '';

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
							if (rows[i].img1.indexOf('undefined') <= -1) {
								request(rows[i].img1).pipe(fs.createWriteStream(productDir+'image1.png'));
							}
							if (rows[i].img2.indexOf('undefined') <= -1) {
								request(rows[i].img2).pipe(fs.createWriteStream(productDir+'image2.png'));
							}
							if (rows[i].img3.indexOf('undefined') <= -1) {
								request(rows[i].img3).pipe(fs.createWriteStream(productDir+'image3.png'));
							}
							if (rows[i].img4.indexOf('undefined') <= -1) {
								request(rows[i].img4).pipe(fs.createWriteStream(productDir+'image4.png'));
							}
							if (rows[i].img5.indexOf('undefined') <= -1) {
								request(rows[i].img5).pipe(fs.createWriteStream(productDir+'image5.png'));
							}
							if (rows[i].img6.indexOf('undefined') <= -1) {
								request(rows[i].img6).pipe(fs.createWriteStream(productDir+'image6.png'));
							}
							if (rows[i].img7.indexOf('undefined') <= -1) {
								request(rows[i].img7).pipe(fs.createWriteStream(productDir+'image7.png'));
							}
							if (rows[i].img8.indexOf('undefined') <= -1) {
								request(rows[i].img8).pipe(fs.createWriteStream(productDir+'image8.png'));
							}
							if (rows[i].img9.indexOf('undefined') <= -1) {
								request(rows[i].img9).pipe(fs.createWriteStream(productDir+'image9.png'));
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

			if (rows[i].class == '行動裝置') {
				rutenClass1 = "手機、通訊";
				rutenClass2 = "代買、海外代購";
				rutenClass3 = "手機代購"

				yahooClass1 = "手機、配件與通訊";
				yahooClass2 = "其他";
				//
			} else if (rows[i].class == '智慧居家' || rows[i].class == '視聽娛樂') {
				rutenClass1 = "家電、影音周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "家電與影音視聽";
				yahooClass2 = "影音/視聽/MP3";
				yahooClass3 = "其他影音設備";
				//
			} else if (rows[i].class == '電腦資訊' || rows[i].class == '科技潮物') {
				rutenClass1 = "電腦、電子、周邊";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "電腦、平板與周邊";
				yahooClass2 = "其他";
				//
			} else if (rows[i].class == '數碼影像') {
				rutenClass1 = "相機、攝影機";
				rutenClass2 = "代買、海外代購";

				yahooClass1 = "相機、攝影與周邊";
				yahooClass2 = "其他";
				//
			} else if (rows[i].class == '美容保養') {
				rutenClass1 = "保養、彩妝";
				rutenClass2 = "國際代購/代買";

				yahooClass1 = "美容保養與彩妝";
				yahooClass2 = "其他"
			}
				//
			// } else { // 科技潮物
			// 	rutenClass1 = "電腦、電子、周邊";
			// 	rutenClass2 = "代買、海外代購";

			// 	yahooClass1 = "電腦、平板與周邊";
			// 	yahooClass2 = "其他";
			// }

			checkRuten();

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
					if (rows[i].img1.indexOf('undefined') <= -1) {
						ele.sendKeys(productDir+'image1.png').then(() => {
							if (rows[i].img2.indexOf('undefined') <= -1) {
								ele.sendKeys(productDir+'image2.png').then(() => {
									if (rows[i].img3.indexOf('undefined') <= -1) {
										ele.sendKeys(productDir+'image3.png').then(() => {
											if (rows[i].img4.indexOf('undefined') <= -1) {
												ele.sendKeys(productDir+'image4.png').then(() => {
													if (rows[i].img5.indexOf('undefined') <= -1) {
														ele.sendKeys(productDir+'image5.png').then(() => {
															if (rows[i].img6.indexOf('undefined') <= -1) {
																ele.sendKeys(productDir+'image6.png').then(() => {
																	if (rows[i].img7.indexOf('undefined') <= -1) {
																		ele.sendKeys(productDir+'image7.png').then(() => {
																			if (rows[i].img8.indexOf('undefined') <= -1) {
																				ele.sendKeys(productDir+'image8.png').then(() => {
																					if (rows[i].img9.indexOf('undefined') <= -1) {
																						ele.sendKeys(productDir+'image9.png');
																					}
																				});
																			}
																		});
																	}
																});
															}
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}

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
				driver.wait(until.elementLocated(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[2]/td/select/option[contains(text(), "'+rows[i].class+'")]'))).then((ele) => {
					ele.click();
					console.log("- 選擇店家分類「"+rows[i].class+"」。");
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
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(1) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 1 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img2.indexOf('undefined') <= -1) {
									checkImage2();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage();
							}
						});
					});
				}

				function checkImage2() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(2) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 2 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img3.indexOf('undefined') <= -1) {
									checkImage3();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage2();
							}
						});
					});
				}

				function checkImage3() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(3) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 3 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img4.indexOf('undefined') <= -1) {
									checkImage4();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage3();
							}
						});
					});
				}

				function checkImage4() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(4) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 4 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img5.indexOf('undefined') <= -1) {
									checkImage5();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage4();
							}
						});
					});
				}

				function checkImage5() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(5) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 5 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img6.indexOf('undefined') <= -1) {
									checkImage6();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage5();
							}
						});
					});
				}

				function checkImage6() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(6) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 6 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img7.indexOf('undefined') <= -1) {
									checkImage7();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage6();
							}
						});
					});
				}

				function checkImage7() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(7) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 7 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img8.indexOf('undefined') <= -1) {
									checkImage8();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage7();
							}
						});
					});
				}

				function checkImage8() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(8) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 8 上傳完成。");
								driver.sleep(1000);
								if (rows[i].img9.indexOf('undefined') <= -1) {
									checkImage9();
								} else {
									RutenLaunching();
								}
							} else {
								driver.sleep(1000);
								checkImage8();
							}
						});
					});
				}

				function checkImage9() {
					console.log("頁面完成，等待圖片上傳完畢 ...");
					driver.wait(until.elementLocated(By.css('div.thumbnail:nth-of-type(9) div.img'))).then((ele) => {
						ele.getAttribute('style').then((style) => { 
							if (style.indexOf('showpic?tofile=') >= 0) {
								console.log("- 圖片 9 上傳完成。");
								driver.sleep(1000);
								RutenLaunching();
							} else {
								driver.sleep(1000);
								checkImage9();
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


				//上傳圖片
				// driver.wait(until.elementLocated(By.css('div.upload-image-wrap input[type="file"]'))).then((ele) => {
				// 	ele.sendKeys(productDir+'image1.png');
				// });
				
				// driver.wait(until.elementLocated(By.css(uploadEle))).then((ele) => {
				// 	if (rows[i].img1.indexOf('undefined') <= -1) {
				// 		driver.findElement(By.css(uploadEle)).then((ele) => {
				// 			ele.sendKeys(productDir+"image1.png");
				// 			if (rows[i].img2.indexOf('undefined') <= -1) {
				// 				driver.findElement(By.css(uploadEle)).then((ele) => {
				// 					ele.sendKeys(productDir+"image2.png"); 
				// 					if (rows[i].img3.indexOf('undefined') <= -1) {
				// 						driver.findElement(By.css(uploadEle)).then((ele) => {
				// 							ele.sendKeys(productDir+"image3.png"); 
				// 						});
				// 					}
				// 				});
				// 			}
				// 		});
				// 	}
				// });

				// 店家分類
				driver.wait(until.elementLocated(By.xpath('//*[@id="product"]/div/div[1]/fieldset/div[1]/div[2]/div/label/select/option[contains(text(), "'+rows[i].class+'")]'))).then((ele) => {
					ele.click();
					console.log("- 選擇店家分類「"+rows[i].class+"」。");
				});

				// 商品名稱
				driver.wait(until.elementLocated(By.css('input[name="itemTitle"]'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, '【'+rows[i].num+'】'+rows[i].name+'【Ai-Tec】');
					console.log("- 填入商品名稱。");
				});

				// 商品簡述 input.description
				driver.wait(until.elementLocated(By.css('input.description'))).then((ele) => {
					driver.executeScript("arguments[0].value = arguments[1]", ele, rows[i].des1);
					console.log("- 填入商品簡述。");
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
				// driver.wait(until.elementLocated(By.xpath('//*[@id="literalMode"]'))).then((ele) => {
				// 	ele.click().then(() => {
				// 		driver.wait(until.elementLocated(By.css('textarea[name="itemDesc"]'))).then((ele) => {
				// 			driver.executeScript("arguments[0].value = arguments[1]", ele, notSourceCode).then(() => {
				// 				driver.wait(until.elementLocated(By.xpath('//*[@id="newHtmlMode"]'))).click();
				// 				console.log("- 填入原始碼。");
				// 				console.log("檢查圖片上傳情況 ...");
				// 				//checkImage();
				// 			});
				// 		});
				// 	});
				// });
				driver.wait(until.elementLocated(By.css('li#literalMode'))).then((ele) => {
					driver.sleep(1000);
					ele.click().then(() => {
						console.log("切換至 HTML Mode");
						driver.wait(until.elementLocated(By.css('textarea.edit-text'))).then((ele) => {
							driver.sleep(1000);
							console.log("切換至原始碼視窗");
							driver.executeScript("arguments[0].value = arguments[1]", ele, notSourceCode).then(() => {
								driver.wait(until.elementLocated(By.css('li#htmlMode'))).then((ele) => {
									driver.sleep(1000);
									console.log("儲存 HTML");
									ele.click().then(() => {
										checkImage();
									});
								});
							});
						});
					});
				});
				

				//https://s.yimg.com/ur/newauctions/img/transparent.gif
				//li.yui3-u:nth-child(1) .irens img

				let uploadEle = 'div.upload-image-wrap input[type="file"]';

				function checkImage() {
					if (rows[i].img1.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image1.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 1 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(1) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 1 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img2.indexOf('undefined') <= -1) {
										checkImage2();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage2() {
					if (rows[i].img2.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image2.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 2 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(2) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 2 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img3.indexOf('undefined') <= -1) {
										checkImage3();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage3() {
					if (rows[i].img3.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image3.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 3 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(3) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 3 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img4.indexOf('undefined') <= -1) {
										checkImage4();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage4() {
					if (rows[i].img4.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image4.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 4 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(4) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 4 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img5.indexOf('undefined') <= -1) {
										checkImage5();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage5() {
					if (rows[i].img5.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image5.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 5 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(5) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 5 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img6.indexOf('undefined') <= -1) {
										checkImage6();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage6() {
					if (rows[i].img6.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image6.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 6 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(6) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 6 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img7.indexOf('undefined') <= -1) {
										checkImage7();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage7() {
					if (rows[i].img7.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image7.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 7 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(7) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 7 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img8.indexOf('undefined') <= -1) {
										checkImage8();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage8() {
					if (rows[i].img1.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image8.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 8 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(8) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 8 上傳完成。");
									driver.sleep(1000);
									if (rows[i].img9.indexOf('undefined') <= -1) {
										checkImage9();
									} else {
										YahooLaunching();
									}
								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				function checkImage9() {
					if (rows[i].img9.indexOf('undefined') <= -1) {
						driver.findElement(By.css(uploadEle)).then((ele) => {
							ele.sendKeys(productDir+'image9.png').then(() => {
								check();
							});
						});
					}
					function check() {
						console.log("頁面完成，等待圖片 9 上傳完畢 ...");
						driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(9) .irens img'))).then((ele) => {
							ele.getAttribute('src').then((src) => { 
								if (src.indexOf('transparent.gif') < 0) {
									console.log("- 圖片 9 上傳完成。");
									driver.sleep(1000);
									YahooLaunching();

								} else {
									driver.sleep(1000);
									check();
								}
							});
						});
					}
				}

				// function checkImage3() {
				// 	console.log("頁面完成，等待圖片上傳完畢 ...");
				// 	driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(3) .irens img'))).then((ele) => {
				// 		ele.getAttribute('style').then((style) => { 
				// 			if (style.indexOf('showpic?tofile=') >= 0) {
				// 				console.log("- 圖片 3 上傳完成。");
				// 				driver.sleep(1000);
				// 				if (rows[i].img4.indexOf('undefined') <= -1) {
				// 					checkImage4();
				// 				} else {
				// 					YahooLaunching();
				// 				}
				// 			} else {
				// 				driver.sleep(1000);
				// 				checkImage3();
				// 			}
				// 		});
				// 	});
				// }

				// function checkImage4() {
				// 	console.log("頁面完成，等待圖片上傳完畢 ...");
				// 	driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(4) .irens img'))).then((ele) => {
				// 		ele.getAttribute('style').then((style) => { 
				// 			if (style.indexOf('showpic?tofile=') >= 0) {
				// 				console.log("- 圖片 4 上傳完成。");
				// 				driver.sleep(1000);
				// 				if (rows[i].img5.indexOf('undefined') <= -1) {
				// 					checkImage5();
				// 				} else {
				// 					YahooLaunching();
				// 				}
				// 			} else {
				// 				driver.sleep(1000);
				// 				checkImage4();
				// 			}
				// 		});
				// 	});
				// }

				// function checkImage5() {
				// 	console.log("頁面完成，等待圖片上傳完畢 ...");
				// 	driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(5) .irens img'))).then((ele) => {
				// 		ele.getAttribute('style').then((style) => { 
				// 			if (style.indexOf('showpic?tofile=') >= 0) {
				// 				console.log("- 圖片 5 上傳完成。");
				// 				driver.sleep(1000);
				// 				if (rows[i].img6.indexOf('undefined') <= -1) {
				// 					checkImage6();
				// 				} else {
				// 					YahooLaunching();
				// 				}
				// 			} else {
				// 				driver.sleep(1000);
				// 				checkImage5();
				// 			}
				// 		});
				// 	});
				// }

				// function checkImage6() {
				// 	console.log("頁面完成，等待圖片上傳完畢 ...");
				// 	driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(6) .irens img'))).then((ele) => {
				// 		ele.getAttribute('style').then((style) => { 
				// 			if (style.indexOf('showpic?tofile=') >= 0) {
				// 				console.log("- 圖片 6 上傳完成。");
				// 				driver.sleep(1000);
				// 				if (rows[i].img7.indexOf('undefined') <= -1) {
				// 					checkImage7();
				// 				} else {
				// 					YahooLaunching();
				// 				}
				// 			} else {
				// 				driver.sleep(1000);
				// 				checkImage6();
				// 			}
				// 		});
				// 	});
				// }

				// function checkImage7() {
				// 	console.log("頁面完成，等待圖片上傳完畢 ...");
				// 	driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(7) .irens img'))).then((ele) => {
				// 		ele.getAttribute('style').then((style) => { 
				// 			if (style.indexOf('showpic?tofile=') >= 0) {
				// 				console.log("- 圖片 7 上傳完成。");
				// 				driver.sleep(1000);
				// 				if (rows[i].img8.indexOf('undefined') <= -1) {
				// 					checkImage8();
				// 				} else {
				// 					YahooLaunching();
				// 				}
				// 			} else {
				// 				driver.sleep(1000);
				// 				checkImage7();
				// 			}
				// 		});
				// 	});
				// }

				// function checkImage8() {
				// 	console.log("頁面完成，等待圖片上傳完畢 ...");
				// 	driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(8) .irens img'))).then((ele) => {
				// 		ele.getAttribute('style').then((style) => { 
				// 			if (style.indexOf('showpic?tofile=') >= 0) {
				// 				console.log("- 圖片 8 上傳完成。");
				// 				driver.sleep(1000);
				// 				if (rows[i].img9.indexOf('undefined') <= -1) {
				// 					checkImage9();
				// 				} else {
				// 					YahooLaunching();
				// 				}
				// 			} else {
				// 				driver.sleep(1000);
				// 				checkImage8();
				// 			}
				// 		});
				// 	});
				// }

				// function checkImage9() {
				// 	console.log("頁面完成，等待圖片上傳完畢 ...");
				// 	driver.wait(until.elementLocated(By.css('li.yui3-u:nth-child(9) .irens img'))).then((ele) => {
				// 		ele.getAttribute('style').then((style) => { 
				// 			if (style.indexOf('showpic?tofile=') >= 0) {
				// 				console.log("- 圖片 9 上傳完成。");
				// 				driver.sleep(1000);
				// 				YahooLaunching();
				// 			} else {
				// 				driver.sleep(1000);
				// 				checkImage9();
				// 			}
				// 		});
				// 	});
				// }

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
