
const {Builder, By, Key, until} = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let dataList = require('./data');
const fs = require('fs');
const path = require('path');
var exec = require('child_process').exec;

let filename = 'rslt/rslt';
let imageFile = './ImageRecognize/pic/get_random_image.png';

let current_index=145;
let current_page_index = 1;
let current_item_index = 4;
let firstRun = true;

function processSync(img) {
	return new Promise((resolve, reject) => {
		exec('python ImageRecognize/tess_test.py '+img, function(err, stdout, stderr) {
				if(err) {
						console.log('image recognize error:', err);
						resolve("emrw")
				}else {
						console.log(stdout);
						fs.readFile('temp.txt', (err, data) => {
							if (err) {
								console.log('read file error:', err);
								// reject(err);
								resolve("emrw")
							}else {
								let str = data.toString();
								console.log(str);								
								str = str.replace(/\n/g,'').replace(/>/g,'7').replace(/-/g,'L').replace('<','L');
								console.log(str);
								resolve(str);
							}
						})
				}
		})
	})
}

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  
  async function dealyzm() {
	console.log('deal yanzhengma');
	try {
	  let nocrawler, flag;
	  try {
	  	await driver.wait(until.elementLocated(By.id('nocrawler_img')), 10000);
	  	nocrawler = await driver.findElements(By.id('nocrawler_img'));
	  	flag = true;
	  } catch (err) {
	  	flag = false;
	  }
	  if (nocrawler && nocrawler.length) {
	  	await driver.sleep(1000);
	  	let src = await nocrawler[0].getAttribute('src');
	  	var base64Data = src.replace(/^data:image\/\w+;base64,/, "")
	  	var dataBuffer = new Buffer(base64Data, 'base64');
	  	await fs.writeFileSync(imageFile, dataBuffer);
	  	let txt = await processSync(path.join(__dirname, imageFile));
	  	console.log(JSON.stringify(txt));
	  	await driver.sleep(Math.random() * 1000);
	  	await driver.findElement(By.id('code')).clear();
	  	await driver.findElement(By.id('code')).sendKeys(txt);
	  	await driver.findElement(By.id('Button1')).click();
	  	await driver.sleep(2000);
	  	let ok = false;
	  	try {
	  		await driver.wait(until.alertIsPresent(), 2000);
	  	} catch (err) {
	  		ok = true;
	  	}
	  	if (!ok) {
	  		let alertDom = await driver.switchTo().alert();
	  		while (alertDom) {
				  await alertDom.accept();
				  await driver.sleep(1000);
	  			await driver.wait(until.elementLocated(By.id('nocrawler_img')), 3000);
	  			nocrawler = await driver.findElements(By.id('nocrawler_img'));
	  			if (nocrawler.length) {
	  				await driver.sleep(1000);
	  				src = await nocrawler[0].getAttribute('src');
	  				base64Data = src.replace(/^data:image\/\w+;base64,/, "")
	  				dataBuffer = new Buffer(base64Data, 'base64');
	  				await fs.writeFileSync(imageFile, dataBuffer);
	  				txt = await processSync(path.join(__dirname, imageFile));
	  				console.log(JSON.stringify(txt));
	  				await driver.sleep(Math.random() * 1000);
	  				await driver.findElement(By.id('code')).clear();
	  				await driver.findElement(By.id('code')).sendKeys(txt);
	  				await driver.findElement(By.id('Button1')).click();
	  				let ok = false;
	  				try {
	  					await driver.wait(until.alertIsPresent(), 2000);
	  					alertDom = await driver.switchTo().alert();
	  				} catch (err) {
	  					ok = true;
	  					alertDom = null;
	  				}
	  			}
	  		}
	  	}
	  }
	  return flag;
	}catch(err) {
		console.log(err);
		return await dealyzm();
	}
  }

  try {
  	await driver.get('https://login.zlbaba.com/login?service=http://www.patexplorer.com/login/cas');
  	await driver.findElement(By.name('username')).sendKeys('15102716009');
  	await driver.findElement(By.name('password')).sendKeys('196226qiang');
  	await driver.sleep(1000);
  	await driver.findElement(By.id('loginBtn')).click();
	await driver.wait(until.urlIs('http://www.patexplorer.com/'), 10000);

	async function dealList(index, page) {
			current_page_index = page;
			if (firstRun) {
				firstRun = false;
			}else{
				current_item_index = 0;
			}
			console.log('####dealList start page: ', page);
			let flag = true;
			try{
				await driver.wait(until.elementLocated(By.css('.paging-next')), 5000);
				console.log('###wait paging-next');
			}catch(err) {
				flag = await dealyzm();
			}
			await driver.sleep(Math.random() * 500 + 500)				
			let divs = await driver.findElements(By.className('u-list-div'));
			console.log('###get u-list-div current_item_index:', current_item_index);
			await driver.sleep(Math.random() * 500 + 500)
			for (let i = current_item_index; i < divs.length; i++) {
				current_item_index = i;
				let cols = [];
				try {
					cols = await divs[i].findElements(By.css('.Js_hl div p'));
				} catch (err) {
					console.log('###get item content error', err);
					await driver.sleep(1000);
					cols = await divs[i].findElements(By.css('.Js_hl div p'));
				}
				console.log('###get item vals');
				let valStr = '\n';
				for (let j = 0; j < cols.length; j++) {
					let colTit;
					let colTitDom = await cols[j].findElements(By.css('strong'));
					console.log('###get col title');
					if (colTitDom.length) {
						try {
							colTit = await colTitDom[0].getText();
						} catch (err) {
							console.log('###get col tit error', err);
							await driver.sleep(1000);
							colVals = await cols[j].getText();
						}
					}
					let colVals;
					try {
						colVals = await cols[j].getText();
					} catch (err) {
						console.log('###get col val error', err);
						await driver.sleep(1000);
						colVals = await cols[j].getText();
					}
					colVals = colVals.split(colTit)[1];
					console.log('txt:', page, i, j, colTit, colVals)
					valStr += colVals + ','
				}
				await fs.appendFileSync(filename + index + '.csv', valStr)
				current_item_index = i+1;
			}
			console.log('####dealList end '+index);
			return flag;
	}

	async function crawlerAll(index) {
		current_index = index;
		if (firstRun) {
			console.log('current_page_index: ', current_page_index);
			try {
				await driver.wait(until.elementLocated(By.css('.paging-next')), 5000);
				await driver.findElement(By.css('.btui-paging-jump>input')).clear();
				await driver.findElement(By.css('.btui-paging-jump>input')).sendKeys(current_page_index, Key.RETURN);
				await driver.sleep(500);
				await driver.wait(until.elementLocated(By.css('.paging-next')), 5000);
			}catch(err) {
				console.log('error:',err)
			}
		}else{
			current_page_index = 1;
			current_item_index = 0;
		}

		let page = current_page_index;
		let flag = await dealList(index, page);
		while (flag) {
			console.log('crawlerList...');
			try{
				await driver.wait(until.elementLocated(By.css('.paging-next')), 5000);
			}catch(err) {
				flag = false;
				return;
			}
			console.log('crawlerList...1');
			let fd = await driver.findElements(By.css('.paging-next.paging-disabled'))
			flag = fd.length == 0;
			if (!flag) return;
			console.log('crawlerList...2');
			let dloadDom = await driver.findElements(By.css('.list-l-download'));
			console.log('crawlerList...3');
			if (dloadDom.length) {
				try{
					await driver.executeScript("document.getElementsByClassName('list-l-download')[0].style.display = 'none';")
				}catch(err) {}
			}
			console.log('crawlerList...4');
			await driver.sleep(500);
			await driver.executeScript("document.getElementsByClassName('paging-next')[0].click()");
			page = page+1;
			await driver.sleep(Math.random() * 2000 + 1000);
			flag = await dealList(index, page);
		}
	}
	// await crawlerAll();

    for (let i = current_index; i < dataList.length; i++) {
		try {
			await driver.executeScript("document.getElementsByClassName('Js_hideSearch')[0].remove();");
			let bySearch = By.css('.serchform .u-search');
			await driver.wait(until.elementLocated(bySearch), 5000);
			await driver.findElement(bySearch).clear();
			await driver.findElement(bySearch).sendKeys(dataList[i].name);
			let s = await driver.findElement(By.css('.search-btn')).getAttribute('title');
			await driver.findElement(By.css('.search-btn')).click();
			console.log('.search-btn: ', s);
		}catch (err) {
			await driver.wait(until.elementLocated(By.name('q')), 5000);
			await driver.findElement(By.name('q')).clear();
			await driver.findElement(By.name('q')).sendKeys(dataList[i].name, Key.RETURN);
		}
		await crawlerAll(i);
	}
		
    while(true) {}
  } catch(err) {
	  console.log(err);
	  firstRun=true;
	  await example();
  } finally {
    // await driver.quit();
  }
})();