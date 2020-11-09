const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

class Item{
	constructor(title, img, price, oldPrice, discount){
		this.title = title;
		this.img = img;
		this.price = price;
		this.oldPrice = oldPrice;

		if(oldPrice !== null && price < oldPrice){
			this.discount = this.oldPrice - this.price;
		} else this.discount = null;
	}

	getPrice(){
		return this.price;
	} 
}

class Items{
	constructor(items, length, sum, avg){
		this.items = items;
		this.length = items.length;
		this.sum = 0;

		for(var i =0; i < this.length; i++){
			this.sum += this.items[i].getPrice();
		}

		this.avg = this.sum / this.length;
	}
}

var title, img, price, discount;
var oldPrice = null;
var items = new Array();

request('https://cdn.adimo.co/clients/Adimo/test/index.html', function (error, response, body) {
    console.error('error:', error); // Print the error if one occurred
    const $ = cheerio.load(body);

    $('div.item').each(function(i, elem){

    	// console.log(elem);
    	// console.log(i);
    	if (elem.children != undefined) {
    		elem.children.forEach((child) => {
    			if (child.type === 'tag' && child.name === 'img') {
    				// console.log(`Image URL: ${child.attribs.src}`);
    				img = "https://cdn.adimo.co/clients/Adimo/test/" + child.attribs.src;
    			}

    			if (child.type === 'tag' && child.name === 'h1' && child.children !== undefined) {
    				child.children.forEach((grandchild) => {
    					if (grandchild.type === 'text') {
    						// console.log(`Title: ${grandchild.data}`);
    						title = grandchild.data;
    					}
    				});    				
    			}

    			if (child.type === 'tag' && child.name === 'span' && child.children !== undefined) {
    				if(child.attribs.class === 'price'){
	    					// console.log(`Price: ${grandchild.data}`);
	    					price = parseFloat(child.children[0].data.substring(1));
	    			} else if(child.attribs.class === 'oldPrice'){
	    					// console.log(`Old Price: ${grandchild.data}`);
	    					oldPrice = parseFloat(child.children[0].data.substring(1));
	    			}
    			}
    		});
    	};
    	var newItem = new Item(title, img, price, oldPrice)
    	oldPrice = null;
    	items.push(newItem);
    });
    var listOfItems = new Items(items);
    var jsonData = JSON.stringify(listOfItems, null, 2);
    fs.writeFile("output.json",jsonData, function(err){
    	if(err){
    		console.log(err);
    	}
    });
});