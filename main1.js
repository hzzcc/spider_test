const { Builder, By, Key, until } = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let dataList = require('./data1');
const fs = require('fs');
const path = require('path');
var exec = require('child_process').exec;

let filename = 'rslt1/rslt';

(async function example() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://www.pss-system.gov.cn/sipopublicsearch/portal/uilogin-forwardLogin.shtml');
        await driver.findElement(By.id('j_username')).sendKeys('haozididi2018');
        await driver.findElement(By.id('j_password_show')).sendKeys('196226qiang');
        await driver.wait(until.urlIs('http://www.pss-system.gov.cn/sipopublicsearch/portal/uiIndex.shtml'));
        console.log('logged in');
        await driver.executeScript("window.open = function(location) {window.location = location}");
        await driver.executeScript("window.open('http://www.pss-system.gov.cn/sipopublicsearch/patentsearch/tableSearch-showTableSearchIndex.shtml')");
        
        console.log('跳转高级检索页面');
        await driver.wait(until.urlIs('http://www.pss-system.gov.cn/sipopublicsearch/patentsearch/tableSearch-showTableSearchIndex.shtml'));
        await driver.sleep(500);
        await driver.findElement(By.id('tableSearchItemIdIVDB020')).sendKeys('澳柯玛股份有限公司');
        await driver.findElement(By.id('tableSearchItemIdIVDB007')).sendKeys('2010');
        await driver.sleep(500);
        await driver.findElement(By.css('.bottom-area .btn.btn-search')).click();
        console.log('begin request all list');
        let byBlocking = By.css('.blockUI.blockMsg.blockPage');

        await driver.wait(until.elementLocated(byBlocking));
        let blocking = await driver.findElement(byBlocking)
        await driver.wait(until.stalenessOf(blocking));
        console.log('has requested all list');
        let allList = await driver.findElements(By.css('.list-container .patent'));
        console.log('allList: ', allList.length);
        while (true) { }
    }catch(err) {
        console.error(err);
    }finally {
        
    }
})();