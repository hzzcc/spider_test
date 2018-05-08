
const {Builder, By, Key, until} = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let dataList = require('./data');
const fs = require('fs');
const path = require('path');
var exec = require('child_process').exec;

let filename = 'rslt/rslt';
let imageFile = './ImageRecognize/pic/get_random_image.png';

let current_index=19;

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
  try {
  	await driver.get('https://login.zlbaba.com/login?service=http://www.patexplorer.com/login/cas');
  	await driver.findElement(By.name('username')).sendKeys('18516551675');
  	await driver.findElement(By.name('password')).sendKeys('huang2601793');
  	await driver.sleep(1000);
  	await driver.findElement(By.id('loginBtn')).click();
	await driver.wait(until.urlIs('http://www.patexplorer.com/'), 10000);
	  
	async function dealList(index) {
			console.log('####dealList start');
			
			let nocrawler;
			try {
				await driver.wait(until.elementLocated(By.id('nocrawler_img')), 5000);
				nocrawler = await driver.findElements(By.id('nocrawler_img'));
			}catch (err){
			}
			if (nocrawler && nocrawler.length) {
				await driver.sleep(1000);
				let src = await nocrawler[0].getAttribute('src');
				var base64Data = src.replace(/^data:image\/\w+;base64,/, "")
				var dataBuffer = new Buffer(base64Data, 'base64');
				await fs.writeFileSync(imageFile, dataBuffer);
				let txt = await processSync(path.join(__dirname,imageFile));
				console.log(JSON.stringify(txt));
				await driver.sleep(Math.random() * 1000);
				await driver.findElement(By.id('code')).clear();
				await driver.findElement(By.id('code')).sendKeys(txt);
				await driver.findElement(By.id('Button1')).click();
				await driver.sleep(2000);
				let ok = false;
				try {
					await driver.wait(until.alertIsPresent(), 2000);
				}catch (err) {
					ok = true;
				}
				if (!ok){
					let alertDom = await driver.switchTo().alert();
					while (alertDom) {
						await alertDom.accept();
						await driver.wait(until.elementLocated(By.id('nocrawler_img')), 3000);
						nocrawler = await driver.findElements(By.id('nocrawler_img'));
						if (nocrawler.length) {
							await driver.sleep(1000);
							src = await nocrawler[0].getAttribute('src');
							base64Data = src.replace(/^data:image\/\w+;base64,/, "")
							dataBuffer = new Buffer(base64Data, 'base64');
							await fs.writeFileSync(imageFile, dataBuffer);
							txt = await processSync(path.join(__dirname,imageFile));
							console.log(JSON.stringify(txt));
							await driver.sleep(Math.random() * 1000);
							await driver.findElement(By.id('code')).clear();
							await driver.findElement(By.id('code')).sendKeys(txt);
							await driver.findElement(By.id('Button1')).click();
							let ok = false;
							try {
								await driver.wait(until.alertIsPresent(), 2000);
								alertDom = await driver.switchTo().alert();
							}catch (err) {
								ok = true;
								alertDom = null;
							}
						}
					}
				}
			}
			
			let flag = true;
			try{
				await driver.wait(until.elementLocated(By.css('.paging-next')), 5000);
			}catch(err) {
				flag = false;
			}
			await driver.sleep(Math.random() * 2000 + 2000)				
			let divs = await driver.findElements(By.className('u-list-div'));
			for (let i = 0; i < divs.length; i++) {
				let cols = await divs[i].findElements(By.css('.Js_hl div p'));
				let valStr = '\n';
				for (let j = 0; j < cols.length; j++) {
					let colTit;
					let colTitDom = await cols[j].findElements(By.css('strong'));
					if (colTitDom.length) colTit = await colTitDom[0].getText();
					let colVals = await cols[j].getText();
					colVals = colVals.split(colTit)[1];
					console.log('txt:', colTit, colVals)
					valStr += colVals+','
				}
				await fs.appendFileSync(filename + index + '.csv', valStr)
			}
			console.log('####dealList end');
			return flag;
	}

	async function crawlerAll(index) {
		let flag = await dealList(index);
		while (flag) {
			try{
				await driver.wait(until.elementLocated(By.css('.paging-next')), 5000);
			}catch(err) {
				flag = false;
				return;
			}
			let fd = await driver.findElements(By.css('.paging-next.paging-disabled'))
			flag = fd.length == 0;
			if (!flag) return;
			let dloadDom = await driver.findElements(By.css('.list-l-download'));
			if (dloadDom.length) {
				await driver.executeScript("document.getElementsByClassName('list-l-download')[0].style.display = 'none';")
			}
			await driver.findElement(By.css('.paging-next')).click();

			flag = await dealList(index);
		}
	}
	// await crawlerAll();

    for (let i = current_index; i < dataList.length; i++) {
		try {
			await driver.wait(until.elementLocated(By.name('q')), 5000);
			await driver.findElement(By.name('q')).clear();
			await driver.findElement(By.name('q')).sendKeys(dataList[i].name, Key.RETURN);
		}catch (err) {
			await driver.sleep(1000);
			await driver.executeScript("document.getElementsByClassName('Js_hideSearch')[0].remove();");
			let bySearch = By.css('.serchform .u-search');
			await driver.wait(until.elementLocated(bySearch), 5000);
			await driver.findElement(bySearch).clear();
			await driver.findElement(bySearch).sendKeys(dataList[i].name);
			let s = await driver.findElement(By.css('.search-btn')).getAttribute('title');
			await driver.findElement(By.css('.search-btn')).click();
			console.log('.search-btn: ', s);
		}
		await crawlerAll(i);
	}
		
    while(true) {}
  } catch(err) {
  	console.log(err);
  } finally {
    // await driver.quit();
  }
})();