var request = require('request');
var cheerio = require('cheerio');

var searchResults = [];

exports.searchYoho = function(searchRange, resultCallback, displayFunc) {

	searchResults = [];

	crawler(searchRange, 0, function(searchResults) {
		resultCallback(searchResults);
	}, displayFunc);

}

function crawler(searchRange, index, searchCallback, displayFunc) {

	var searchUrl = "http://www.yohohongkong.com/product/"+searchRange[index];

	displayFunc(index, searchRange.length);

	if (index >= searchRange.length) {
		//displayFunc(index, searchRange.length);
		searchCallback(searchResults);
		return;
	}

	request({
		url: searchUrl,
		method: "GET"
	},

	function (e, r, b) {
		if (e || !b) { return; }

		var $ = cheerio.load(b);

		function productObj(isLive ,Num, Img, Brand, Name, Price, ClassA, ClassB, ClassC, Code, Warranty) {
			this.isLive = isLive;
			this.Num = Num;
			this.Img = Img;
			this.Brand = Brand;
			this.Name = Name;
			this.Price = Price;
			this.ClassA = ClassA;
			this.ClassB = ClassB;
			this.ClassC = ClassC;
			this.Code = Code;
			this.Warranty = Warranty;
		}

		// 商品名稱
		var productNumber = searchRange[index];

		var productImg = $('div.pic_view img:nth-child(1)').attr('src');
			productImg = 'http://www.yohohongkong.com' + productImg;

		var productBrand = $('div.brand-logo a').attr('href');
		if (productBrand !== undefined) {
			productBrand = productBrand.split("-");
			(productBrand.length > 2) ? productBrand = productBrand[1] +"-"+ productBrand[2] : productBrand = productBrand[1];
		} else {
			productBrand = "Unknown";
		}

		var productName = $('dt.product_name h1').text();
			productName = productName.replace(/香港行貨/g, "海外公司貨");
			productName = productName.replace(/智能手機/g, "智慧型手機");
			productName = productName.replace(/即影即有相機/g, "拍立得相機");
			productName = productName.replace(/單鏡反光相機/g, "單眼相機");
			productName = productName.replace(/洗面機/g, "洗臉機");
			productName = productName.replace(/導入導出機/g, "導入導出儀");
			productName = productName.replace(/剃鬚刨/g, "刮鬍刀");
			productName = productName.replace(/蒸面機/g, "蒸臉儀");
			productName = productName.replace(/脫毛/g, "美體除毛");
			productName = productName.replace(/剃毛器/g, "美體刀");
			productName = productName.replace(/雪櫃/g, "冰箱");
			productName = productName.replace(/抽濕機/g, "除濕機");
			productName = productName.replace(/電熱水煲/g, "熱水瓶");
			productName = productName.replace(/焗爐/g, "烤箱");
			productName = productName.replace(/蒸焗爐/g, "蒸氣烤箱");
			productName = productName.replace(/榨汁機/g, "果汁機");
			productName = productName.replace(/多士爐/g, "烤麵包機");
			productName = productName.replace(/多士焗爐/g, "烤箱");
			productName = productName.replace(/電子高速煲/g, "電子壓力鍋");
			productName = productName.replace(/慢煮機/g, "舒肥機");
			productName = productName.replace(/電飯煲/g, "電鍋");
			productName = productName.replace(/電筒/g, "手電筒");
			productName = productName.replace(/相片打印/g, "相片列印");
			productName = productName.replace(/打印/g, "列印");
			productName = productName.replace(/外置硬碟/g, "外接硬碟");
			productName = productName.replace(/手提電話/g, "手機");

		var productPrice = $('del.goods-market-price').text();
		if (productPrice != '') { 
			productPrice = $('strong.goods-price').text();
			productPrice = productPrice.split(' ');
			productPrice = Number(productPrice[1]);
		} else {
			productPrice = productPrice.split(' ');
			productPrice = Number(productPrice[2]);
		}

		console.log("1 - "+productPrice);
		productPrice = productPrice * 4 * 1.12;
		console.log("2 - "+productPrice);
		if (productPrice < 5000) {
			productPrice = productPrice + 200;
		} else {
			productPrice = productPrice + 500;
		}
		console.log("3 - "+productPrice);

		productPrice = Math.round(productPrice);
		productPrice = productPrice.toString();
		productPrice = productPrice.split('');
		productPrice[productPrice.length-1] = "0";
		productPrice[productPrice.length-2] = "8";
		productPrice = productPrice.join('');

		var productClassA = $('div.menus a:nth-of-type(2)').text();
		var productClassB = $('div.menus a:nth-of-type(3)').text();
		var productClassC = $('div.menus a:nth-of-type(4)').text();

		productClassC = productClassC.replace(/智能手機/g,"智慧型手機");
		productClassC = productClassC.replace(/行動電源/g,"充電器");
		productClassC = productClassC.replace(/數據線/g,"傳輸線");
		productClassC = productClassC.replace(/充電器/g,"充電器");
		productClassC = productClassC.replace(/自拍神棍/g,"行動配件");
		productClassC = productClassC.replace(/電池/g,"行動配件");
		productClassC = productClassC.replace(/手機防水袋/g,"行動配件");
		productClassC = productClassC.replace(/手機腳架/g,"行動配件");
		productClassC = productClassC.replace(/保護貼/g,"保護貼/玻璃貼");
		productClassC = productClassC.replace(/Case \/ Cover/g,"保護殼/保護套");
		productClassC = productClassC.replace(/手機配件/g,"行動配件");
		productClassC = productClassC.replace(/手機鏡頭/g,"行動配件");
		productClassC = productClassC.replace(/玻璃貼/g,"保護貼/玻璃貼");
		productClassC = productClassC.replace(/電子書閱讀器/g,"電子書閱讀器");
		productClassC = productClassC.replace(/藍牙喇叭/g,"藍牙喇叭");
		productClassC = productClassC.replace(/耳機/g,"有線耳機");
		productClassC = productClassC.replace(/藍牙耳機/g,"藍牙耳機");
		productClassC = productClassC.replace(/錄音筆/g,"麥克風");
		productClassC = productClassC.replace(/耳擴/g,"行動耳擴");
		productClassC = productClassC.replace(/收音機/g,"音響劇院");
		productClassC = productClassC.replace(/音樂播放器/g,"音樂播放器");
		productClassC = productClassC.replace(/運動追踪器/g,"運動追蹤器");
		productClassC = productClassC.replace(/運動手錶/g,"運動手錶");
		productClassC = productClassC.replace(/智能手錶/g,"智慧手錶");
		productClassC = productClassC.replace(/兒童智能手錶/g,"智慧手錶");
		productClassC = productClassC.replace(/虛擬現實頭盔/g,"VR頭戴顯示器");
		productClassC = productClassC.replace(/運動裝置/g,"運動感測裝置");
		productClassC = productClassC.replace(/其它穿戴式裝置/g,"穿戴裝置配件");
		productClassC = productClassC.replace(/360度全景相機/g,"360全景相機");
		productClassC = productClassC.replace(/運動攝影機/g,"運動攝影機");
		productClassC = productClassC.replace(/航拍攝影機/g,"空拍無人機");
		productClassC = productClassC.replace(/即影即有相機/g,"拍立得相機");
		productClassC = productClassC.replace(/監控攝影機/g,"監視攝影機");
		productClassC = productClassC.replace(/手持穩定器/g,"相機穩定器");
		productClassC = productClassC.replace(/輕便相機/g,"輕便相機");
		productClassC = productClassC.replace(/單鏡反光相機/g,"單眼相機");
		productClassC = productClassC.replace(/相機袋/g,"相機包");
		productClassC = productClassC.replace(/數碼攝錄機/g,"數位攝影機");
		productClassC = productClassC.replace(/相機配件/g,"相機配件");
		productClassC = productClassC.replace(/產品攝影棚/g,"簡易攝影棚");
		productClassC = productClassC.replace(/電子防潮箱/g,"防潮箱");
		productClassC = productClassC.replace(/閃光燈/g,"閃光燈");
		productClassC = productClassC.replace(/腳架及雲台/g,"相機配件");
		productClassC = productClassC.replace(/鏡頭/g,"鏡頭");
		productClassC = productClassC.replace(/防潮箱/g,"防潮箱");
		productClassC = productClassC.replace(/無反相機/g,"無反光單眼");
		productClassC = productClassC.replace(/洗面機/g,"洗臉機");
		productClassC = productClassC.replace(/導入導出機/g,"導入導出儀");
		productClassC = productClassC.replace(/噴霧保濕器/g,"噴霧保濕器");
		productClassC = productClassC.replace(/電動剃鬚刨/g,"電動刮鬍刀");
		productClassC = productClassC.replace(/睫毛捲曲器/g,"睫毛捲曲器");
		productClassC = productClassC.replace(/電動修眉器/g,"修眉器");
		productClassC = productClassC.replace(/美唇器/g,"美唇器");
		productClassC = productClassC.replace(/蒸面機/g,"其他美容用品");
		productClassC = productClassC.replace(/眼部護理/g,"其他美容用品");
		productClassC = productClassC.replace(/風筒/g,"吹風機");
		productClassC = productClassC.replace(/捲髮器/g,"捲髮器");
		productClassC = productClassC.replace(/剪髮器/g,"理髮器");
		productClassC = productClassC.replace(/美髮儀器/g,"美髮儀器");
		productClassC = productClassC.replace(/生髮/g,"其他美容用品");
		productClassC = productClassC.replace(/電動牙刷/g,"電動牙刷");
		productClassC = productClassC.replace(/水牙線機/g,"洗牙機");
		productClassC = productClassC.replace(/脫毛機/g,"除毛機");
		productClassC = productClassC.replace(/光學美容機/g,"光學美容機");
		productClassC = productClassC.replace(/微電流機/g,"微電流裝置");
		productClassC = productClassC.replace(/RF射頻機/g,"RF射頻裝置");
		productClassC = productClassC.replace(/按摩器/g,"按摩器");
		productClassC = productClassC.replace(/美甲儀器/g,"其他美容用品");
		productClassC = productClassC.replace(/電視機/g,"遺珠");
		productClassC = productClassC.replace(/冷氣機/g,"遺珠");
		productClassC = productClassC.replace(/洗衣機/g,"遺珠");
		productClassC = productClassC.replace(/雪櫃/g,"遺珠");
		productClassC = productClassC.replace(/乾衣機/g,"遺珠");
		productClassC = productClassC.replace(/電熱水爐/g,"遺珠");
		productClassC = productClassC.replace(/抽油煙機/g,"遺珠");
		productClassC = productClassC.replace(/吸塵機/g,"吸塵器");
		productClassC = productClassC.replace(/風扇/g,"電風扇");
		productClassC = productClassC.replace(/空氣清新機/g,"空氣清淨機");
		productClassC = productClassC.replace(/抽濕機/g,"除濕機");
		productClassC = productClassC.replace(/掃地機械人/g,"掃地機器人");
		productClassC = productClassC.replace(/加濕機/g,"加濕器");
		productClassC = productClassC.replace(/熨斗/g,"熨斗");
		productClassC = productClassC.replace(/浴室寶/g,"遺珠");
		productClassC = productClassC.replace(/抹窗機械人/g,"洗窗機器人");
		productClassC = productClassC.replace(/照明燈具/g,"智慧家庭");
		productClassC = productClassC.replace(/電暖氈/g,"電熱毯");
		productClassC = productClassC.replace(/衣車/g,"遺珠");
		productClassC = productClassC.replace(/抽氣扇/g,"換氣扇");
		productClassC = productClassC.replace(/雪糕機/g,"遺珠");
		productClassC = productClassC.replace(/紅酒櫃/g,"遺珠");
		productClassC = productClassC.replace(/香薰機/g,"遺珠");
		productClassC = productClassC.replace(/室內電話/g,"室內電話");
		productClassC = productClassC.replace(/暖爐\/暖風機/g,"暖爐/暖風扇");
		productClassC = productClassC.replace(/變壓器/g,"變壓器");
		productClassC = productClassC.replace(/咖啡機/g,"咖啡機");
		productClassC = productClassC.replace(/電熱水煲/g,"電子鍋");
		productClassC = productClassC.replace(/微波爐/g,"微波爐");
		productClassC = productClassC.replace(/電飯煲/g,"電子鍋");
		productClassC = productClassC.replace(/豆漿機/g,"其他家電");
		productClassC = productClassC.replace(/榨汁機/g,"果汁機");
		productClassC = productClassC.replace(/電磁爐/g,"電磁爐");
		productClassC = productClassC.replace(/水波爐/g,"水波爐");
		productClassC = productClassC.replace(/麵包機/g,"其他家電");
		productClassC = productClassC.replace(/焗爐/g,"電烤箱");
		productClassC = productClassC.replace(/蒸焗爐/g,"蒸氣烤箱");
		productClassC = productClassC.replace(/攪拌機/g,"攪拌裝置");
		productClassC = productClassC.replace(/濾水器/g,"其他家電");
		productClassC = productClassC.replace(/廚師機/g,"其他家電");
		productClassC = productClassC.replace(/電解水機/g,"其他家電");
		productClassC = productClassC.replace(/食物風乾機/g,"其他家電");
		productClassC = productClassC.replace(/光波爐/g,"其他家電");
		productClassC = productClassC.replace(/洗碗碟機/g,"其他家電");
		productClassC = productClassC.replace(/真空機/g,"其他家電");
		productClassC = productClassC.replace(/高速壓力煲/g,"其他家電");
		productClassC = productClassC.replace(/多士爐/g,"電烤箱");
		productClassC = productClassC.replace(/電蒸爐/g,"其他家電");
		productClassC = productClassC.replace(/慢煮機/g,"其他家電");
		productClassC = productClassC.replace(/其他家庭電器/g,"其他家電");
		productClassC = productClassC.replace(/雪茄櫃/g,"其他家電");
		productClassC = productClassC.replace(/微型投影機/g,"微型投影機");
		productClassC = productClassC.replace(/音響/g,"音響劇院");
		productClassC = productClassC.replace(/TVBox/g,"電視盒/機上盒");
		productClassC = productClassC.replace(/DVD機/g,"音響劇院");
		productClassC = productClassC.replace(/投影機/g,"投影機");
		productClassC = productClassC.replace(/CD機/g,"音響劇院");
		productClassC = productClassC.replace(/麥克風/g,"麥克風");
		productClassC = productClassC.replace(/藍光機/g,"藍光播放機");
		productClassC = productClassC.replace(/手提電腦/g,"筆記型電腦");
		productClassC = productClassC.replace(/平板電腦/g,"平板電腦");
		productClassC = productClassC.replace(/桌上電腦/g,"桌上型電腦");
		productClassC = productClassC.replace(/迷你電腦/g,"桌上型電腦");
		productClassC = productClassC.replace(/電腦袋/g,"電腦週邊配件");
		productClassC = productClassC.replace(/電腦螢幕/g,"電腦螢幕");
		productClassC = productClassC.replace(/電腦喇叭/g,"電腦週邊配件");
		productClassC = productClassC.replace(/鍵盤/g,"鍵盤/滑鼠");
		productClassC = productClassC.replace(/滑鼠/g,"鍵盤/滑鼠");
		productClassC = productClassC.replace(/鍵盤及滑鼠組合/g,"鍵盤/滑鼠");
		productClassC = productClassC.replace(/滑鼠墊/g,"電腦週邊配件");
		productClassC = productClassC.replace(/傳真機/g,"遺珠");
		productClassC = productClassC.replace(/電筒/g,"遺珠");
		productClassC = productClassC.replace(/鬧鐘/g,"遺珠");
		productClassC = productClassC.replace(/電腦週邊配件/g,"電腦週邊配件");
		productClassC = productClassC.replace(/電拖板/g,"電腦週邊配件");
		productClassC = productClassC.replace(/繪圖板/g,"繪圖板");
		productClassC = productClassC.replace(/電腦線材/g,"電腦週邊配件");
		productClassC = productClassC.replace(/手寫板/g,"電腦週邊配件");
		productClassC = productClassC.replace(/USB分線器/g,"電腦週邊配件");
		productClassC = productClassC.replace(/讀卡器/g,"電腦週邊配件");
		productClassC = productClassC.replace(/WiFi增強器/g,"電腦週邊配件");
		productClassC = productClassC.replace(/交換器/g,"電腦週邊配件");
		productClassC = productClassC.replace(/LAN線/g,"電腦週邊配件");
		productClassC = productClassC.replace(/路由器/g,"路由器");
		productClassC = productClassC.replace(/網路攝影機/g,"電腦週邊配件");
		productClassC = productClassC.replace(/網絡儲存裝置/g,"電腦週邊配件");
		productClassC = productClassC.replace(/PocketWiFi/g,"電腦週邊配件");
		productClassC = productClassC.replace(/USB手指/g,"電腦週邊配件");
		productClassC = productClassC.replace(/外置硬碟/g,"電腦週邊配件");
		productClassC = productClassC.replace(/記憶卡/g,"電腦週邊配件");
		productClassC = productClassC.replace(/SSD固態硬碟/g,"SSD固態硬碟");
		productClassC = productClassC.replace(/流動相片打印機/g,"行動相片列印機");
		productClassC = productClassC.replace(/墨水\/碳粉/g,"電腦週邊配件");
		productClassC = productClassC.replace(/3D打印機/g,"3D列印機");
		productClassC = productClassC.replace(/多合一打印機/g,"多合一事務機");
		productClassC = productClassC.replace(/標籤機/g,"標籤機");
		productClassC = productClassC.replace(/電競椅/g,"遺珠");
		productClassC = productClassC.replace(/處理器/g,"電腦週邊配件");
		productClassC = productClassC.replace(/記憶體/g,"電腦週邊配件");
		productClassC = productClassC.replace(/音效卡/g,"音效卡");
		productClassC = productClassC.replace(/主機板/g,"主機板");
		productClassC = productClassC.replace(/硬碟/g,"電腦週邊配件");
		productClassC = productClassC.replace(/顯示卡/g,"顯示卡");
		productClassC = productClassC.replace(/光碟機/g,"電腦週邊配件");
		productClassC = productClassC.replace(/汽車空氣清新機/g,"汽車空氣濾淨器");
		productClassC = productClassC.replace(/行車記錄儀/g,"行車紀錄器");
		productClassC = productClassC.replace(/車用手機架/g,"手機/平板車架");
		productClassC = productClassC.replace(/USB充電器/g,"USB車充");
		productClassC = productClassC.replace(/死火過江龍/g,"引擎熄火過電器");
		productClassC = productClassC.replace(/雷達測速器/g,"雷達探測器");
		productClassC = productClassC.replace(/嬰兒護理/g,"母嬰護理");
		productClassC = productClassC.replace(/嬰兒餵哺/g,"母嬰護理");
		productClassC = productClassC.replace(/科技學習/g,"智慧玩具");
		productClassC = productClassC.replace(/玩具/g,"智慧玩具");
		productClassC = productClassC.replace(/驅蚊器/g,"行動配件");
		productClassC = productClassC.replace(/單車/g,"遺珠");
		productClassC = productClassC.replace(/保溫杯/g,"保溫餐具");
		productClassC = productClassC.replace(/食物保溫杯/g,"保溫餐具");
		productClassC = productClassC.replace(/花灑/g,"其他家電");
		productClassC = productClassC.replace(/數據卡/g,"遺珠");
		productClassC = productClassC.replace(/行李箱/g,"遺珠");
		productClassC = productClassC.replace(/頸枕/g,"遺珠");
		productClassC = productClassC.replace(/雨傘/g,"其他家電");
		productClassC = productClassC.replace(/無線電對講機/g,"其他家電");

		var Warranty = $('div#seller_note div.content').text();
		var productWarranty;

		if (Warranty.indexOf("原裝行貨") >= 0) {
			productWarranty = "香港公司貨";
		} else if (Warranty.indexOf("保養條款不適用本產品") >= 0) {
			productWarranty = "配件與消耗品";
		} else {
			productWarranty = "歐美日水貨";
		}

		var productCode = $('#goods_desc div.content').html();

		var isLive;
		var isLiveEle = $('span.goods-stay-tuned-header-text').text();
		if (isLiveEle !== '') {
			isLive = "庫存不足";
		} else if (isNaN(productPrice) || productPrice == '0') {
			isLive = "已下架";
		} else {
			isLive = "正常供貨";
		}

		var product = new productObj(isLive, productNumber, productImg, productBrand, productName, productPrice, productClassA, productClassB, productClassC, productCode, productWarranty);

		//console.log(searchRange[index]+" - "+productName);

		searchResults.push(product);
		index++;
		crawler(searchRange, index, searchCallback, displayFunc);

		// if ( index != (searchRange.length-1) ) {
		// 	searchResults.push(product);

		// 	let nextIndex = Number(index + 1);
		// 	crawler(searchRange, nextIndex, callback);
		// 	//cb2(Number(index)+1, searchRange.length);
		// } else if ( index == (searchRange.length-1) ) {
		// 	searchResults.push(product);

		// 	console.log("Search done, callback function is working.")
		// 	callback(searchResults);
		// 	//cb2(Number(index)+1, searchRange.length);
		// }
	});

}