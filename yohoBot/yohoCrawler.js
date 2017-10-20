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

		function productObj(isLive ,Num, Img, Brand, Name, Price, ClassA, ClassB, Code) {
			this.isLive = isLive;
			this.Num = Num;
			this.Img = Img;
			this.Brand = Brand;
			this.Name = Name;
			this.Price = Price;
			this.ClassA = ClassA;
			this.ClassB = ClassB;
			this.Code = Code;
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

		var productPrice = $('del.goods-market-price').text();
		if (productPrice == '') { 
			productPrice = $('strong.goods-price').text();
			productPrice = productPrice.split(' ');
			productPrice = Number(productPrice[1]);
		} else {
			productPrice = productPrice.split(' ');
			productPrice = Number(productPrice[2]);
		}
		var productClassB = $('div.menus a:nth-of-type(2)').text();
		var productClassA = $('div.menus a:nth-of-type(3)').text();

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

		var product = new productObj(isLive, productNumber, productImg, productBrand, productName, productPrice, productClassA, productClassB, productCode);

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