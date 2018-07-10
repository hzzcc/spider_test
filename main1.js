const { Builder, By, Key, until } = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let dataList = require('./data1');
const fs = require('fs');
const path = require('path');
var exec = require('child_process').exec;

let filename = 'rslt2/';
let imageFile = './pic/get_random_image.png';

const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
let current_index = 26;
let current_year = 2;
let current_page_index = 21;
let isNotFirst = false;

let oldConsole = console.log;
console.log = function(...args) {
    oldConsole(new Date().toLocaleString(), ": ", ...args);
}

function replaceNbsps(str) {
    var re = new RegExp(String.fromCharCode(160), "g");
    var re2 = new RegExp(String.fromCharCode(32), "g");
    return str.replace(re, "").replace(re2, "");
}

(async function example() {
    let driver = await new Builder().forBrowser('chrome').build();


    async function removeOverlay() {
        await driver.executeScript(`
            var blocks = document.getElementsByClassName('blockOverlay');
            var blockLen = blocks.length;
            for (var i = blockLen - 1; i >= 0; i--) {
                blocks[i].remove();
            }
        `)
    }

    async function getAll() {
        try {
            await driver.executeScript("window.location.href = 'http://www.pss-system.gov.cn/sipopublicsearch/patentsearch/tableSearch-showTableSearchIndex.shtml'");
            for (let j = current_year; j < years.length; j++) {
                const year = years[j];
                for (let i = current_index; i < dataList.length; i++) {
                    //start per
                    console.log(i, ',跳转高级检索页面');
                    await driver.wait(until.urlIs('http://www.pss-system.gov.cn/sipopublicsearch/patentsearch/tableSearch-showTableSearchIndex.shtml'));
                    try {
                        await driver.wait(until.elementLocated(By.id('tableSearchItemIdIVDB020')), 1000);
                    }catch(err) {

                    }
                    await driver.findElement(By.id('tableSearchItemIdIVDB020')).clear();
                    await driver.findElement(By.id('tableSearchItemIdIVDB007')).clear();
                    await driver.sleep(500);
                    await driver.findElement(By.id('tableSearchItemIdIVDB020')).sendKeys(JSON.stringify(dataList[i].name));
                    await driver.sleep(500);
                    await driver.findElement(By.id('tableSearchItemIdIVDB007')).sendKeys(year + "");
                    await removeOverlay();
                    await driver.findElement(By.css('.bottom-area .btn.btn-search')).click();


                    if (current_page_index > 0) {
                        let byBlocking = By.css('.blockUI.blockMsg.blockPage');
                        try {
                            await driver.wait(until.elementLocated(byBlocking), 2500);
                            let blocking = await driver.findElement(byBlocking)
                            await driver.wait(until.stalenessOf(blocking), 2500);
                        } catch (err) {

                        }
                        await driver.wait(until.elementLocated(By.css('.input_bottom input')));
                        await driver.findElement(By.css('.input_bottom input')).clear();
                        await driver.findElement(By.css('.input_bottom input')).sendKeys((current_page_index + 1) + "", Key.RETURN);
                    }

                    await crawlerAll(year, i);
                    current_page_index = 0;
                }   
                current_index = 0;
            }
        }catch(err) {
            isNotFirst = false;
            await getAll();
        }
    }

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
        if (isNotFirst) {
            current_page_index = 0;
        }
        isNotFirst = true;
        await dealList(index, year, current_page_index);
        let hasNext = await getNextPage();
        while (hasNext) {
            await hasNext.click();
            current_page_index = current_page_index + 1;
            await dealList(index, year, current_page_index);
            hasNext = await getNextPage();
        }
    }

    //
    
    async function dealList(index, year, page) {
        current_page_index = page;
        console.log('begin request all list: ', index, year, page);
        let byBlocking = By.css('.blockUI.blockMsg.blockPage');
        try {
            await driver.wait(until.elementLocated(byBlocking), 1500);
            let blocking = await driver.findElement(byBlocking)
            await driver.wait(until.stalenessOf(blocking), 1500);
        }catch(err) {

        }
        console.log('has requested all list');
        await driver.sleep(1500 + Math.random() * 500);

        // if (page === 0) {
        //     let total = await driver.findElement(By.css("#page_top .page_top")).getText();
        //     let arr = total.split("页");
        //     let tmpStr = arr.length === 3 ? total.split("页")[2] : total.split("页")[1];
        //     total = replaceNbsps(tmpStr.split("条数据")[0].replace(" ", ""));
        //     console.log('total: "' + total + '"');

        //     await fs.appendFileSync(filename + year + "/total.csv", `${index},${total}\n`);
        // }

        let str = "";
        let allList = await driver.findElements(By.css('.list-container .patent'));
        console.log('allList: ', allList.length);

        for (let i = 0; i < allList.length; i++) {
            const ele = allList[i];
            let name = await ele.findElement(By.css('.item-header h1 a b')).getText();
            console.log(i, ': ', name);
            let tags = await ele.findElements(By.css('.item-header .btn-group .btn'));
            let valStr = `${index},${page},${i},${name}`;
            for (let j = 0; j < tags.length; j++) {
                const tag = tags[j];
                let tagText = await tag.getText();
                console.log(j + ",tag: ", tagText);
                if (tagText.indexOf("引证") !== -1) {
                    let yinzhengnum = parseInt(tagText.replace("引证：", ""));
                    if (yinzhengnum > 0) {
                        await driver.executeScript(`
                            var jqmenu = document.getElementById('view_mode_selector');
                            jqmenu && jqmenu.remove();
                        `)
                        console.log('remove jq-select-menu');
                        await driver.sleep(500 + Math.random() * 800);
                        console.log('tag click');
                        await removeOverlay();
                        await tag.click();
                        await dealRefList(index, year, page, i);
                        try {
                            await driver.wait(until.elementLocated(By.css(".blockUI.blockOverlay")), 2500);
                            blocking = await driver.findElement(By.css(".blockUI.blockOverlay"))
                            await driver.wait(until.stalenessOf(blocking), 2500);
                        } catch (err) {

                        }
                        await removeOverlay();
                        try {
                            await driver.findElement(By.css('.ui-dialog-grid .ui-dialog-close')).click();
                        }catch(err) {

                        }
                    }
                }
                valStr += "," + tagText;
            }
            str += valStr + "\n";
        }
        // await fs.appendFileSync(filename + year + "/rslt" + index + '.csv', str);
        console.log('####dealList end ' + index);
    }

    async function dealRefList(index, year, page, i, refPage = 0) {
        console.log('dealRefList..');
        try {
            await driver.wait(until.elementLocated(By.css(".blockUI.blockOverlay")), 2500);
            let blocking = await driver.findElement(By.css(".blockUI.blockOverlay"))
            await driver.wait(until.stalenessOf(blocking), 2500);
        }catch(err) {

        }
        await driver.sleep(300 + Math.random() * 500);
        let trs = await driver.findElements(By.css('#containerLeftTable table tbody tr'));
        console.log('table tr len: ', trs.length);
        for (let m = 0; m < trs.length; m++) {
            const tr = trs[m];
            let tds = await tr.findElements(By.css('td'));
            let refs = await tds[5].getText();
            console.log('=============================')
            console.log(index, year, page, i, refPage, refs);
            let refsArr = refs.split(";");
            for (let l = 0; l < refsArr.length; l++) {
                const rf = refsArr[l];
                let fd = dataList.find(function (r) { return rf.indexOf(r.name) !== -1 });
                if (fd) {
                    let str = `${index},${page},${i},${fd.name}\n`;
                    await fs.appendFileSync(filename + year + "/rslt" + index + '.csv', str);
                }
            }
            console.log('=============================')
        }
        await driver.executeScript("var sd = document.getElementsByClassName('ui-dialog-content')[0]; sd && (sd.scrollTop = 500)");
        let pageCont = await driver.findElements(By.css('#paginationLeftId ul li'));
        let activePage;
        try {
            activePage = await driver.findElement(By.css('#paginationLeftId ul li.active')).getText();
        } catch(err) {

        }
        if (activePage && activePage < pageCont.length) {
            await driver.executeScript(`
                var blocks = document.getElementsByClassName('blockOverlay');
                var blockLen = blocks.length;
                for (var i = blockLen - 1; i >= 0; i--) {
                    blocks[i].remove();
                }
            `)
            await pageCont[activePage].findElement(By.css('a')).click();
            await dealRefList(index, year, page, i, ++refPage);
        }

    }

    try {
        await driver.get('http://www.pss-system.gov.cn/sipopublicsearch/portal/uilogin-forwardLogin.shtml');
        // await driver.findElement(By.id('j_username')).sendKeys('haoqiang_wu');
        // await driver.findElement(By.id('j_username')).sendKeys('haozididi2018');
        await driver.findElement(By.id('j_username')).sendKeys('han670786269');
        await driver.findElement(By.id('j_password_show')).sendKeys('hanwei19930904');
        // await driver.findElement(By.id('j_username')).sendKeys('hzz_cc');
        // await driver.findElement(By.id('j_password_show')).sendKeys('huangclh520');

        // await driver.wait(until.elementLocated(By.id('codePic')));

        // let nocrawler = await driver.findElements(By.id('codePic'));
        // if (nocrawler.length) {
        //     let src = await driver.executeScript(`
        //         var img = document.getElementById('codePic');
        //         var canvas = document.createElement('CANVAS');
        //         var ctx = canvas.getContext('2d');
        //         var dataURL;
        //         canvas.height = img.naturalHeight;
        //         canvas.width = img.naturalWidth;
        //         ctx.drawImage(img, 0, 0);
        //         dataURL = canvas.toDataURL();
        //         console.log('dataURL:',dataURL);
        //         return dataURL;
        //     `)
        //     console.log('img response :', src)

        //     let base64Data = src.replace(/^data:image\/\w+;base64,/, "")
        //     let dataBuffer = new Buffer(base64Data, 'base64');
        //     await fs.writeFileSync(imageFile, dataBuffer);
        //     let txt = await processSync(path.join(__dirname, imageFile));
        //     console.log(JSON.stringify(txt));
        //     await driver.sleep(Math.random() * 500 + 500);
        //     await driver.findElement(By.id('code')).clear();
        //     await driver.findElement(By.id('code')).sendKeys(txt);
        //     await driver.findElement(By.id('Button1')).click();
        // } else {
        // }
        // return;

        await driver.wait(until.urlIs('http://www.pss-system.gov.cn/sipopublicsearch/portal/uiIndex.shtml'));
        console.log('logged in');
        await driver.executeScript(`
            window.open = function(location) {
                console.log('open:',location);
                if (location.indexOf('uishowStatisticPage-initStatisticPage.shtml') == -1) {
                    window.location = location;
                }
            }; 
            window.alert = function(msg) {console.log('alert:',msg)}; 
            window.confirm = function(msg) {console.log('confirm:',msg)};`);
        await driver.executeScript("window.open('http://www.pss-system.gov.cn/sipopublicsearch/patentsearch/tableSearch-showTableSearchIndex.shtml')");
        
        await getAll();

        while (true) { }
    }catch(err) {
        console.error(err);
    }finally {
        // await driver.quit();
    }
})();