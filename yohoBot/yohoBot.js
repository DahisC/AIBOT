var async = require('async');
var rimraf = require('rimraf');
var request = require('request');
var fs = require('fs');

var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;

var chrome = require('selenium-webdriver/chrome');

var yohoBot = require('./yohoBot.js');
var yohoSheet = require('./yohoSheet.js');

/* ------------------------------------------------------------------------------------------------ */

// configure browser options ...
var options = new chrome.Options()
	//options.addArguments("user-data-dir=D:/Bot/Default");
	options.addArguments("user-data-dir=C:/Users/khpr/AppData/Local/Google/Chrome/User Data/Default");

//var productDir = "D:/AIBOT/image/";
var productDir = "C:/Users/khpr/Downloads/AIBOT/_image/";
/* ------------------------------------------------------------------------------------------------ */

exports.launching = function(resultArray, rows, func1, func2) {

	// func1 為修改前端顯示進度畫面的函式 func1(sign, text)

	for (i=0; i < resultArray.length; i++) {
		for (j=0; j < rows.length; j++) {
			if (resultArray[i].Num == rows[j].num) {
				resultArray[i].timestamp = rows[j].timestamp;
				resultArray[i].yohotw = rows[j].yohotw;
				resultArray[i].ruten = rows[j].ruten;
				resultArray[i].yahoo = rows[j].yahoo;
				resultArray[i].shopee = rows[j].shopee;
				resultArray[i].pchome = rows[j].pchome;
				// +1 為表單偏移值
				resultArray[i].row = j+2;
			}
		}
	}

	prepareLaunch(resultArray, rows, "0", func1, func2);
}

function prepareLaunch(resultArray, rows, index, func1, func2) {
	
	// func 1 sign


	var i = index;
	var r = resultArray[i];

	var rutenClass1;

	var yahooClass1;

	var sourceCode;

	checkIndex();
	// 

	//func2(resultArray, i);


	function checkIndex() {
		if (index != resultArray.length) { checkLive(); } else { console.log("完成"); return;}
	}

	function checkLive() {
		if (resultArray[i].isLive == '正常供貨') { checkLaunched(); } else { launchNext1("無法上架：友和香港無法供貨"); return;}
	}

	function checkLaunched() {
		if (resultArray[i].timestamp == '') { editContent(); } else { launchNext1("無法上架：重複上架"); return;}
	}

	function launchNext1(text) {
		console.log(text);
		i++;
		prepareLaunch(resultArray, rows, i, func1, func2);
	}

	function editContent() {

		console.log("-----------EDIT------------");
		console.log(r);
		console.log("-------------EDIT------------------");

		var nameString = r.Name;
			nameString = nameString.replace(/香港行貨/g, "台灣公司貨");
			nameString = nameString.replace(/智能手機/g, "智慧型手機");
			nameString = nameString.replace(/即影即有相機/g, "拍立得相機");
			nameString = nameString.replace(/單鏡反光相機/g, "單眼相機");
			nameString = nameString.replace(/洗面機/g, "洗臉機");
			nameString = nameString.replace(/導入導出機/g, "導入導出儀");
			nameString = nameString.replace(/剃鬚刨/g, "刮鬍刀");
			nameString = nameString.replace(/蒸面機/g, "蒸臉儀");
			nameString = nameString.replace(/脫毛/g, "美體除毛");
			nameString = nameString.replace(/剃毛器/g, "美體刀");
			nameString = nameString.replace(/雪櫃/g, "冰箱");
			nameString = nameString.replace(/抽濕機/g, "除濕機");
			nameString = nameString.replace(/電熱水煲/g, "熱水瓶");
			nameString = nameString.replace(/焗爐/g, "烤箱");
			nameString = nameString.replace(/蒸焗爐/g, "蒸氣烤箱");
			nameString = nameString.replace(/榨汁機/g, "果汁機");
			nameString = nameString.replace(/多士爐/g, "烤麵包機");
			nameString = nameString.replace(/多士焗爐/g, "烤箱");
			nameString = nameString.replace(/電子高速煲/g, "電子壓力鍋");
			nameString = nameString.replace(/慢煮機/g, "舒肥機");
			nameString = nameString.replace(/電飯煲/g, "電鍋");
			nameString = nameString.replace(/電筒/g, "手電筒");
			nameString = nameString.replace(/相片打印/g, "相片列印");
			nameString = nameString.replace(/打印/g, "列印");
			nameString = nameString.replace(/外置硬碟/g, "外接硬碟");

		r.Name = "【"+r.Num+"】"+nameString+"《Ai-Tec》";

		if (r.ClassB == '美容及護理') {
			yahooClass1 = "美容保養與彩妝";
			rutenClass1 = "保養、彩妝";
		} else {
			yahooClass1 = "美容保養與彩妝";
		}

		// 

		let warranty = '<div id="AITB_warranty" class="col-md-12" style="font-family: &quot;Microsoft YaHei&quot;;"><img src="http://imageshack.com/a/img834/9688/4w7v.png" style="width: 100%; font-family: &quot;Microsoft YaHei&quot;; margin-top: 20px; margin-bottom: 20px;"><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">本產品自海外直接進口，本店提供 3 個月免費保固，期間非人為損傷可直接替換新品或免費送修。</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">可開立發票與統編。</p><hr style="font-family: &quot;Microsoft YaHei&quot;;"></div>';
		let statment = '<hr><div id="AITB_statment" class="col-md-12" style="font-family: &quot;Microsoft YaHei&quot;;"><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;">下標前叮嚀</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">因為庫存狀況不一，請您於下標前先參照「關於我」以及於問與答中確認是否還有商品庫存。</p><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;"> 寄送時間 </p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">現貨商品將於下標結帳後，宅配或超商寄出。約於下標後 2 天內寄出，3-4 天內抵達。</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">若為預購商品，等候時間以本店公布時間為準；到貨後可能會自台灣或海外直接寄出予買家。</p><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;">退貨或換貨</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">若商品於到貨後本身有瑕疵（非人為因素造成之損傷或損壞），我們將受理退貨或換新品之要求。</p><p class="title" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: lightcoral; margin: 10px;">商品猶豫期</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">商品到貨後七天內您享有商品猶豫期（非試用期），但只限於商品包裝保持未拆封且未使用的情況下。</p><p class="content" style="font-family: &quot;Microsoft YaHei&quot;; font-size: 110%; font-weight: bold; color: black; margin: 10px;">若您於期間內決定不購買，可將商品寄回，我們會在收到商品並確認後將款項退回。若已經拆封、使用，本店將視情況酌收整新處理費。</p></div>';

		sourceCode = warranty + r.Code;
		sourceCode = sourceCode + statment;

		r.Price = r.Price * 30;

		startLaunch();
	}

	function startLaunch() {

		console.log(resultArray[i].Name);
		saveImage();

		function saveImage() {

			var productDir = "C:/Users/khpr/Downloads/AIBOT/_image/";

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
							request(resultArray[i].Img).pipe(fs.createWriteStream(productDir+'image1.png'));
							startDriver();
		 					callback(null);
						}
				}
			]);
		}

		function startDriver() {

			var target;

			var driver = new webdriver.Builder()
				.forBrowser('chrome')
				.setChromeOptions(options)
				.build();

			checkYoho();

			function checkYoho() {
				if (resultArray[i].yohotw == '') { launchYoho(function() {checkYahoo(); }); } else { checkYahoo(); }
			}

			function checkYahoo() {
				if (resultArray[i].yahoo == '') { launchYahoo(function() { checkRuten(); }); } else { checkRuten(); }
			}

			function checkRuten() {
				if (resultArray[i].ruten == '') {launchRuten(function() { checkShopee(); }); } else { checkShopee(); }
			}

			function checkShopee() {
				if (resultArray[i].shopee == '') {launchShopee(function() { launchNext("商品 "+resultArray[i].Name+" 上架完畢"); }); } else { launchNext("商品 "+resultArray[i].Name+" 上架完畢"); }
			}

			function launchNext(text) {
				console.log(text);
				driver.quit();
				i++;
				prepareLaunch(resultArray, rows, i, func1, func2);
			}

			function launchYoho(callback) {

				var ele;

				_0();

				function _0() {
					driver.get("https://www.taiwanyoho.com/x/goods.php?act=add").then(function() {
						// 商品名稱
						ele = driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[1]/td[2]/span[1]/input'));
						driver.executeScript('arguments[0].value = arguments[1]', ele, r.Name)
						_1();
					});
				}

				function _1() {
					driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[2]/td[2]/select/option[contains(text(),"機器人預設分類")]')).click().then(function() {
						_2();
					});
				}

				function _2() {
					// 選擇品牌
					driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[4]/td[2]/select/option[contains(text(),"ZZZ1")]')).then(
						function(ele) {
							ele.click().then(function() {
								_3();
							});
							// 找不到分類就執行這段增加品牌
						}, function(err) {
							driver.findElement(By.css('a[title="添加品牌"]')).click();
							driver.findElement(By.css('input[name="addedBrandName"]')).sendKeys("ZZZ1");
							driver.findElement(By.css('#brand_add > a:nth-child(2)')).click();
							_2();
						});
				}

				function _3() {
					// 分類
					driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[5]/td[2]/div/ul/li/input')).click().then(function() {
						// 選擇香港友和
						driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[5]/td[2]/div/div/ul/li[3]')).click().then(function() {
							_4();
						});
					});
				}

				function _4() {
					// 價格
					driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[6]/td[2]/input[1]')).then(function(ele) {
						ele.clear();
						ele.sendKeys(r.Price).then(function() {
							// 數量
							driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[7]/td[2]/input[1]')).then(function(ele) {
								ele.sendKeys(999).then(function() {
									_5();
								});
							});
						});
					});
				}

				function _5() {
					// 上傳圖片
					driver.findElement(By.css('#general-table > tbody > tr:nth-child(11) > td:nth-child(2) > div > input')).then(function(ele) {
						ele.sendKeys(productDir+"image1.png").then(function() {
							_6();
						});
					});
				}

				function _6() {
					// 產品重量
					driver.findElement(By.css('#general-table > tbody > tr:nth-child(12) > td:nth-child(2) > input[type="text"]:nth-child(1)')).then(function(ele) {
						ele.clear();
						ele.sendKeys(1).then(function() {
							driver.findElement(By.xpath('//*[@id="general-table"]/tbody/tr[16]/td[2]/select/option[contains(text(),"香港公司貨")]')).click().then(function() {
								// 切換到詳細描述分頁
								driver.findElement(By.xpath('//*[@id="detail-tab"]')).click().then(function() {
									// 切換 iframe (否則抓不到內嵌的元素)
									driver.switchTo().frame('goods_desc___Frame').then(function() {
										// 使用原始碼上架按鈕
										driver.findElement(By.css('div[title="原始碼"]')).click().then(function() {
											ele = driver.findElement(By.css('textarea.SourceField'));
											driver.executeScript('arguments[0].value = arguments[1]', ele, sourceCode).then(function() {
												_end();
											});
										});
									});
								});
							});
						});
					});
				}

				function _end() {
					// 切回原本的 iframe
					driver.switchTo().defaultContent();
					driver.findElement(By.css('input[type="submit"]')).click().then(function() {
						driver.wait(until.elementLocated(By.css('body > h1 > span.action-span > a'))).click().then(function() {
							var yohoUrl = driver.findElement(By.css('div.list-div tr:nth-child(2) td a:nth-child(1)'));
							yohoUrl.getAttribute('href').then(function(href) {
								yohoSheet.writeIn("yohotw", href, r.row)
								callback();
							});
						
							// driver.findElement(By.css('body > h1 > span.action-span > a')).click().then(function() {
							// 	ele = driver.findElement(By.css('div.list-div tr:nth-child(2) td:nth-child(12) span'));
							// 	ele.click().then(function() {
							// 		driver.sleep(1000);
							// 		ele.sendKeys("5");
							// 		// ele.sendKeys(5).then(function() {
							// 		// 	//driver.findElement(By.css('div.list-div tr:nth-child(2) td a:nth-child(1)')).click();
							// 		// });
							// 	});
							// 	//driver.executeScript('arguments[0].value = arguments[1]', ele, 5)
							// });
						});
					});
				}
//*[@id="general-table"]/tbody/tr[4]/td[2]/select/option[5]
				// ele = driver.wait(until.elementLocated(By.css('input[name=goods_name]')));
				// ele.sendKeys(resultArray[i].Name);
				// //callback();
			}

			function launchYahoo(callback) {

				var yele;
				
				_0();

				function _0() {
					driver.get('https://tw.bid.yahoo.com/partner/merchandise/select_type?hpp=hp_auc_navigation_01').then(() => {
						driver.findElement(By.css('input[data-rapid_p="3"]')).click().then(() => {
							_1();
						});
					});
				}

				function _1() {

					driver.findElement(By.css('input[value="1"]')).click();

					console.log(yahooClass1);
					if (yahooClass1 == "美容保養與彩妝") {
						choose('美容保養與彩妝', '其他');
					}

					function choose() {

						for (i=0; i<=arguments.length; i++) {

							driver.sleep(1000);
							if (i == 0) {
								driver.findElement(By.xpath('//*[@id="bd"]/div[2]/div/div[1]/form/fieldset[2]/ul[2]/li[1]/div/div[1]/select/option[contains(text(), "'+arguments[0]+'")]')).click();
							} else if(i == 1) {
								driver.findElement(By.xpath('//*[@id="bd"]/div[2]/div/div[1]/form/fieldset[2]/ul[2]/li[1]/div/div[3]/select/option[contains(text(), "'+arguments[1]+'")]')).click();
							} else if (i == arguments.length) {
								_2();
							}
						}
					}
				}

				function _2() {
					// 按下分類頁面確認鍵
					driver.findElement(By.css('input.button-submit')).click().then(() => {
						// 等待頁面元素載入
						driver.wait(until.elementLocated(By.css('select[name="customCategory"] option[value="60"]'))).then(() => {
							// 店家分類：注目商品
							driver.findElement(By.css('select[name="customCategory"] option[value="60"]')).click().then(() => {
								// 名字
								yele = driver.findElement(By.css('input[name="itemTitle"]'));
								driver.executeScript('arguments[0].value = arguments[1]', yele, r.Name);
								_3();
							})
						})
					});
				}

				function _3() {
					// 上傳圖片
					driver.findElement(By.css('div.upload-image-wrap input[type="file"]')).sendKeys(productDir+"image1.png").then(() => {
						_4();
					});
				}

				function _4() {
					// 商品數量
					driver.findElement(By.xpath('//*[@id="totalQuantity"]')).then((ele) => {
						ele.clear().then(() => {
							ele.sendKeys(999).then(() => {
								// 價格
								driver.findElement(By.xpath('//*[@id="salePrice"]')).sendKeys(r.Price).then(() => {
									_5();
								});
							});
						});
					});
				}

				function _5() {
					// 原始碼
					driver.findElement(By.xpath('//*[@id="literalMode"]')).click().then(() => {
						yele = driver.findElement(By.css('textarea[name="itemDesc"]'));
						driver.executeScript("arguments[0].value = arguments[1];", yele, sourceCode).then(() => {
							driver.findElement(By.xpath('//*[@id="htmlMode"]')).click().then(() => {
								_end();
							});
						});
					});
				}

				function _end() {
					driver.findElement(By.css('input[value="下一步"]')).click().then(() => {
						driver.wait(until.elementLocated((By.css('input[value="送出"]')))).then(() => {
							driver.findElement((By.css('input[value="送出"]'))).click();
						});
					});
				}



			}

			function launchRuten(callback) {
				
				_0();

				function _0() {
					// 上架頁面
					driver.get('https://mybid.ruten.com.tw/upload/step1.htm').then(function() {
						// 單品上架
						driver.findElement(By.xpath('/html/body/div/div[3]/div/div/a[1]/span')).click().then(function() {
							// 等待載入上架頁面
							driver.wait(until.elementLocated(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(),"電腦、電子、周邊")]'))).then(function() {
								_1();
							});
						});
					});
				}

				function _1() {

					// 分類一
					driver.findElement(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(), "'+rutenClass1+'")]')).click().then(function() {
						driver.sleep(2000);
						// 分類二
						driver.findElement(By.xpath('//*[@id="goods_class_select"]/ul/li[contains(text(), "'+rutenClass2+'")]')).click().then(function() {
							_2();
						});
					});
				}

				function _2() {
					driver.findElement(By.css('#image_uploader > div > div.tool-bar.hint > div > label.action > input')).sendKeys(productDir+"image1.png").then(function() {
						// 名稱
						targetElement = driver.findElement(By.css('#g_name'));
						driver.executeScript("arguments[0].value = arguments[1];", targetElement, r.Name);
						// 店家分類
						driver.findElement(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[2]/td/select/option[contains(text(), "☆注目商品☆")]')).click().then(function() {
							// 價格
							driver.findElement(By.xpath('//*[@id="main_form"]/div[4]/table/tbody/tr[3]/td/div[1]/label/input')).sendKeys(r.Price).then(function() {
								driver.findElement(By.css('#show_num')).sendKeys(999).then(function() {
									_3();
								});
							});
						});
					});
				}

				function _3() {
					// 原始碼
					driver.findElement(By.xpath('//*[@id="mce_7"]/button/i')).click().then(function() {
						// 貼上原始碼
						targetElement = driver.findElement(By.className('mce-textbox'));
						driver.executeScript("arguments[0].value = arguments[1];", targetElement, sourceCode).then(function() {
							// 確認
							driver.findElement(By.xpath('//*[@id="mce_46"]/button')).click().then(function() {
								_4();
							});
						});
					});
				}

				function _4() {
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
					// 運送方式套用預設值
					driver.findElement(By.xpath('//*[@id="main_form"]/div[5]/table/tbody/tr[1]/td/ul/li/label/input'))
						.click().then(function() {
							_5();
						});
				}

				function _5() {
					// 等待圖片上傳
					driver.sleep(5000);

					// 下一步
					driver.findElement(By.css('input[value="下一步"]'))
						.click().then(function() {
							driver.wait(until.elementLocated(By.css('input[value="確認送出"]'))).then(function() {
								driver.findElement(By.css('input[value="確認送出"]')).click().then(function() {
									driver.wait(until.elementLocated(By.css('body > div > div.rt-wrap > div.rt-text-large.item-upload-result > span'))).then(function() {
										var rutenUrl = driver.findElement(By.css('div.rt-panel-inner td.text-left:nth-child(2) a'));
											rutenUrl.getAttribute('href').then(function(href) {
												yohoSheet.writeIn("ruten", href, r.row);
												callback();
											});
									})
								})
							});
					});
				}

			}

			function launchShopee(callback) {
				console.log("!shopee");
				callback();
			}

			// function launchNext(text) {
			// 	driver.quit();
			// 	i++;
			// 	prepareLaunch(resultArray, rows, i, func1, func2);
			// }

		}
	}
}

	// var i = resultArrayIndex;
	// var now = resultArray[i];

	// var allowLaunch = checkLaunch();
	// (allowLaunch) ? console.log("ok") : yohoBot.launching(resultArray, rows, i);

	// function checkLaunch() {
	// 	console.log('Now checking... '+now.Num+' '+now.Name);
	// 	if (now.isLive == '已下架' || now.isLive == '庫存不足') {
	// 		console.log("無法上架!!");
	// 		i++;
	// 		//launching(resultArray, rows, i);
	// 		return false;
	// 	} else {
	// 		console.log("開始上架~~");
	// 		//prepareLaunch();
	// 		return true;
	// 	}
	// }

	// function prepareLaunch() {

	// 	async.series([
	// 		function deleteDir(callback) {
	// 			rimraf(productDir, function() { callback(null); });
	// 		},

	// 		function createDir(callback) {
			
	// 			setTimeout(func_createDir, 3000);

	// 			function func_createDir() {
	// 				fs.mkdirSync(productDir, function(err) {
	// 					if (err) {}
	// 				});
	// 				callback(null);
	// 			}
	// 		},

	// 		function saveImages(callback) {
	// 			// 此處不能使用這個函式轉換執行路徑，會影響第二次按下按鈕時的刪除資料夾動作
	// 			// 解法為在底下的寫入照片時加上寫入路徑即可
	// 			//process.chdir(productDir);
	// 			setTimeout(func_saveImages, 1500);
	// 				function func_saveImages() {
	// 					request(resultArray[index].Img).pipe(fs.createWriteStream(productDir+'_image1.png'));
 // 						callback(null);
	// 				}
	// 		}

	// ]);
	// }