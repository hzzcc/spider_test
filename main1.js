const { Builder, By, Key, until } = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let dataList = require('./data1');
const fs = require('fs');
const path = require('path');
var exec = require('child_process').exec;

let filename = 'rslt1/';
const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
let current_index = 1;
let current_year = 0;
let current_page_index = 0;

function replaceNbsps(str) {
    var re = new RegExp(String.fromCharCode(160), "g");
    var re2 = new RegExp(String.fromCharCode(32), "g");
    return str.replace(re, "").replace(re2, "");
}

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
        
        async function getNextPage() {
            let next_page;
            let page_bottom_links = await driver.findElements(By.css('.page_bottom a'));
            for (let index = 0; index < page_bottom_links.length; index++) {
                const ele = page_bottom_links[index];
                let link_text = await ele.getText();
                if (link_text === '下一页') {
                    next_page = ele;
                }
            }
            return next_page;
        }

        async function crawlerAll(year, index) {
            console.log('crawlerAll: ', index);
            current_page_index = 0;
            await dealList(index, year, current_page_index);
            let hasNext = await getNextPage();
            while (hasNext) {
                hasNext.click();
                current_page_index = current_page_index + 1;
                await dealList(index, year, current_page_index);
                hasNext = await getNextPage();
            }
        }

        for (let j = current_year; j < years.length; j++) {
            const year = years[j];
            for (let i = current_index; i < dataList.length; i++) {
                //start per
                console.log(i, ',跳转高级检索页面');
                await driver.wait(until.urlIs('http://www.pss-system.gov.cn/sipopublicsearch/patentsearch/tableSearch-showTableSearchIndex.shtml'));
                await driver.sleep(500);
                await driver.findElement(By.id('tableSearchItemIdIVDB020')).clear();
                await driver.findElement(By.id('tableSearchItemIdIVDB007')).clear();
                await driver.findElement(By.id('tableSearchItemIdIVDB020')).sendKeys(dataList[i].name);
                await driver.findElement(By.id('tableSearchItemIdIVDB007')).sendKeys(year + "");
                await driver.sleep(500);
                await driver.findElement(By.css('.bottom-area .btn.btn-search')).click();

                await crawlerAll(year, i);
            }   
        }

        //
        
        await next_page.click();

        async function dealList(index, year, page) {
            current_page_index = index;
            console.log('begin request all list: ', index, year, page);
            let byBlocking = By.css('.blockUI.blockMsg.blockPage');
            await driver.wait(until.elementLocated(byBlocking));
            let blocking = await driver.findElement(byBlocking)
            await driver.wait(until.stalenessOf(blocking));
            console.log('has requested all list');
            await driver.sleep(500);

            if (page === 0) {
                let total = await driver.findElement(By.css("#page_top .page_top")).getText();
                let arr = total.split("页");
                let tmpStr = arr.length === 3 ? total.split("页")[2] : total.split("页")[1];
                total = replaceNbsps(tmpStr.split("条数据")[0].replace(" ", ""));
                console.log('total: "' + total + '"');

                await fs.appendFileSync(filename + year + "/total.csv", `${index},${total}\n`);
            }

            let str = '';
            let allList = await driver.findElements(By.css('.list-container .patent'));
            console.log('allList: ', allList.length);

            for (let index = 0; index < allList.length; index++) {
                const ele = allList[index];
                let name = await ele.findElement(By.css('.item-header h1 a b')).getText();
                console.log(index, ': ', name);
                let tags = await ele.findElements(By.css('.item-header .btn-group .btn'));
                let valStr = name;
                for (let j = 0; j < tags.length; j++) {
                    const tag = tags[j];
                    let tagText = await tag.getText();
                    console.log(index + ",tag: ", tagText);
                    valStr += "," + tagText;
                }
                str += valStr + "\n";
            }
            await fs.appendFileSync(filename + year + "/rslt" + index + '.csv', str);
            console.log('####dealList end ' + index);
        }

        while (true) { }
    }catch(err) {
        console.error(err);
    }finally {
        // await driver.quit();
    }
})();