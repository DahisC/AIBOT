var request = require('request');
var cheerio = require('cheerio');

var searchResults = [];

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

				search(rows, 0);

			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}

function search(rows, index) {


	i = index;

	if (rows[i].searched == "") {
		startSearch();
	} else {
		if (i == (rows.length-1)) {
			i++;
			console.log("done");
		} else {
			i++;
			search(rows, i);
		}
	}

	function startSearch() {
		request({
			url: rows[i].producturl,
			method: "GET"
		},

		function (e, r, b) {
			if (e || !b) { return; }

			var $ = cheerio.load(b);

			function productObj(name, price, des1, des2, p_from, p_warranty, p_time, img1, img2, img3, img4, img5, img6, img7, img8, img9, sourceCode) {
				this.name = name;
				this.price = price;
				this.des1 = des1;
				this.des2 = des2;
				this.p_from = p_from;
				this.p_warranty = p_warranty;
				this.p_time = p_time;
				this.img1 = img1;
				this.img2 = img2;
				this.img3 = img3;
				this.img4 = img4;
				this.img5 = img5;
				this.img6 = img6;
				this.img7 = img7;
				this.img8 = img8;
				this.img9 = img9;
				this.sourceCode = sourceCode;
			}

			// 商品名稱
			var name = $('h3.title').text();

			var price = $('ins#recommanded-price').text();
				price = price.trim();
				price = price.substr(3);
			console.log("------------------");
			console.log(price);
			console.log("------------------");

			var des1 = $('h4.promote font:nth-of-type(1) b').text();

			var des2 = $('h4.promote font:nth-of-type(2)').text();

			var p_from = $('div.desc li:nth-of-type(1)').text();

			var p_warranty = $('div.desc li:nth-of-type(2)').text();

			var p_time = $('div.desc li:nth-of-type(3)').text();

			var img1 = $('#thumbnail-list span:nth-of-type(1) img').attr('src');
				img1 = "http:"+img1;

			var img2 = $('#thumbnail-list span:nth-of-type(2) img').attr('src');
				img2 = "http:"+img2;

			var img3 = $('#thumbnail-list span:nth-of-type(3) img').attr('src');
				img3 = "http:"+img3;

			var img4 = $('#thumbnail-list span:nth-of-type(4) img').attr('src');
				img4 = "http:"+img4;

			var img5 = $('#thumbnail-list span:nth-of-type(5) img').attr('src');
				img5 = "http:"+img5;

			var img6 = $('#thumbnail-list span:nth-of-type(6) img').attr('src');
				img6 = "http:"+img6;

			var img7 = $('#thumbnail-list span:nth-of-type(7) img').attr('src');
				img7 = "http:"+img7;

			var img8 = $('#thumbnail-list span:nth-of-type(8) img').attr('src');
				img8 = "http:"+img8;

			var img9 = $('#thumbnail-list span:nth-of-type(9) img').attr('src');
				img9 = "http:"+img9;

			var sourceCode = $('div.content').html();
				sourceCode = sourceCode.trim();

			var product = new productObj(name, price, des1, des2, p_from, p_warranty, p_time, img1, img2, img3, img4, img5, img6, img7, img8, img9, sourceCode);

			//console.log(product);
			writeInSheet(product, i, function() {
				console.log("+++");
				console.log(i);
				console.log(rows.length);
				if (i == (rows.length-1)) {
					i++
					console.log("done");
				} else {
					i++;
					search(rows, i);
				}

			});
			// searchResults.push(product);
			// index++;
			// crawler(searchRange, index, searchCallback, displayFunc);
		});
	}

}

function writeInSheet(product, i, callback) {
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
				console.log('Loaded doc: '+info.title+' by '+info.author.email);
				sheet = info.worksheets[0];
				step();
			});
		},

		function workingWithCells(step) {

			var row = i + 2;

			sheet.getCells({
				'min-row': row,
				'max-row': row,
				'min-col': 3,
				'max-col': 22,
				'return-empty': true
			},	function(err, cells) {

				cells[1].setValue(product.name, null);
				cells[2].setValue(product.price, null);
				//cells[3].setValue("", null);
				//cells[4].setValue("", null);
				cells[5].setValue(product.des1, null);
				cells[6].setValue(product.des2, null);
				cells[7].setValue(product.p_from, null);
				cells[8].setValue(product.p_warranty, null);
				cells[9].setValue(product.p_time, null);
				cells[10].setValue(product.img1, null);
				cells[11].setValue(product.img2, null);
				cells[12].setValue(product.img3, null);
				cells[13].setValue(product.img4, null);
				cells[14].setValue(product.img5, null);
				cells[15].setValue(product.img6, null);
				cells[16].setValue(product.img7, null);
				cells[17].setValue(product.img8, null);
				cells[18].setValue(product.img9, null);
				cells[19].setValue(product.sourceCode, null);

				callback();

				// var cell = cells[0];

				// console.log("將網址 "+url+" 寫入儲存格中...");
				// cell.setValue(formula, null);
				// callback();

			});
		}

		],	function(err) {
			if (err) { console.log('Google Spreadsheet Error: '+err)};
	});
}