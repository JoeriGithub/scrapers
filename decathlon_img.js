const url = "https://www.decathlon.nl/browse/c0-sporten/c1-wandelen/c2-wandelschoenen/_/N-1wogzce"
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage();

    await page.goto(url);

    const cookiebutton = await page.$x('//*[@id="didomi-notice-agree-button"]')
    await cookiebutton[0].click()

    const images = await page.$$('img');
    const filteredImages = new Set();

    canScrape = true

    let pagina = 1

    while (canScrape) {
        for (let image of images) {
            let src = await image.getProperty('src');
            let srcValue = await src.jsonValue();

            if (srcValue.includes('.jpg?format=auto&f=')) {
                let newSrcValue = srcValue.replace(/\.jpg\?format=auto&f=.*/, '.jpg?format=auto&f=500x500');
                filteredImages.add(newSrcValue);
            }
        }

        let nextButton = await page.$x('//*[@id="app"]/main/div[2]/section[2]/nav[2]/button[2]')
        if (nextButton.length == 0 || pagina == 200) {
            canScrape = false
        } else {
            await nextButton[0].click()
            pagina++;
        }
    }

    const links = Array.from(filteredImages);
    const linksJSON = JSON.stringify(links);
    
    fs.writeFile('imgsdec.json', linksJSON, (err) => {
        if (err) throw err;
    });

    await browser.close();
})();
