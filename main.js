
const {Builder, By, Key, until} = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let dataList = require('./data');
const fs = require('fs');

let filename = 'rslt.csv';

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
  	await driver.get('https://login.zlbaba.com/login?service=http://www.patexplorer.com/login/cas');
  	await driver.findElement(By.name('username')).sendKeys('');
  	await driver.findElement(By.name('password')).sendKeys('');
  	await driver.sleep(1000);
  	await driver.findElement(By.id('loginBtn')).click();
  	await driver.wait(until.urlIs('http://www.patexplorer.com/'), 5000);

		await driver.findElement(By.name('q')).sendKeys('澳柯玛股份有限公司', Key.RETURN);

		async function dealList() {
				await driver.wait(until.elementLocated(By.css('.paging-next')), 20000);
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
					await fs.appendFileSync(filename, valStr)
				}
		}

		async function crawlerAll() {
			await dealList();
			let flag = true;
			while (flag) {
				let fd = await driver.findElements(By.css('.paging-next.paging-disabled'))
				flag = fd.length == 0;
				let dloadDom = await driver.findElements(By.css('.list-l-download'));
				if (dloadDom.length) {
					await driver.executeScript("document.getElementsByClassName('list-l-download')[0].style.display = 'none';")
				}
				await driver.findElement(By.css('.paging-next')).click();

				await dealList();
			}
		}
		await crawlerAll();

    for (let i = 1; i < dataList.length; i++) {
			await driver.findElement(By.name('q')).sendKeys(dataList[i].name, Key.RETURN);
			await crawlerAll();
		}
		
    while(true) {}
  } catch(err) {
  	console.log(err);
  } finally {
    // await driver.quit();
  }
})();