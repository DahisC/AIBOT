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
			productName = productName.replace(/香港行貨/g, "台灣公司貨");
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

		var Warranty = $('div#seller_note div.content').text();
		var productWarranty;

		if (Warranty.indexOf("原裝行貨") >= 0) {
			productWarranty = "海外公司貨";
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