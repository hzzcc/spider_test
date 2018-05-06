
const {Builder, By, Key, until} = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
  	await driver.get('https://login.zlbaba.com/login?service=http://www.patexplorer.com/login/cas');
  	await driver.findElement(By.name('username')).sendKeys('18516551675');
  	await driver.findElement(By.name('password')).sendKeys('huang2601793');
  	await driver.sleep(1000);
  	await driver.findElement(By.id('loginBtn')).click();
  	await driver.wait(until.urlIs('http://www.patexplorer.com/'), 5000);

	await driver.findElement(By.name('q')).sendKeys('澳柯玛股份有限公司', Key.RETURN);

	async function dealList() {
		await driver.sleep(5000);
	    let divs = await driver.findElements(By.className('u-list-div'));
	    for (var i = divs.length - 1; i >= 0; i--) {
	    	let txt = await divs[i].getText();
	    	console.log('txt:',txt)
	    }
	}

    await dealList();

    let flag = true;
    while (flag) {
   		let fd = await driver.findElements(By.css('.paging-next.paging-disabled'))
   		flag = fd.length == 0;
   		await driver.findElement(By.css('.paging-next')).click();

   		await dealList();
    }
    
    while(true) {

	}
  } catch(err) {
  	console.log(err);
  } finally {
    await driver.quit();
  }
})();