var request = require('request');
var cheerio = require('cheerio');

var resultArray = [];

exports.searchYoho = function(searchArray, cb1, cb2) {

	resultArray = [];

	crawler(searchArray, "0", function(resultArray) {
		cb1(resultArray);
	}, cb2);

}

function crawler(searchArray, currentIndex, callback, cb2) {

	var searchUrl = "http://www.yohohongkong.com/product/"+searchArray[currentIndex];

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
		var productNumber = searchArray[currentIndex];

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

		//console.log(searchArray[currentIndex]+" - "+productName);

		if ( currentIndex != (searchArray.length-1) ) {
			resultArray.push(product);

			var nextIndex = Number(currentIndex + 1);
			crawler(searchArray, nextIndex, callback, cb2);
			cb2(Number(currentIndex)+1, searchArray.length);
		} else if ( currentIndex == (searchArray.length-1) ) {
			resultArray.push(product);

			console.log("Search done, callback function is working.")
			callback(resultArray);
			cb2(Number(currentIndex)+1, searchArray.length);
		}
	});

}