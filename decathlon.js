const url = "https://www.decathlon.nl/browse/c0-sporten/c1-wandelen/c2-wandelschoenen/_/N-1wogzce"
const puppeteer = require('puppeteer');
const fs = require("fs");


(async () => {
    let links = []
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    const cookiebutton = await page.$x('//*[@id="didomi-notice-agree-button"]')
    await cookiebutton[0].click()

    let canScrape = true
    let index = 2
    let pagina = 1

    while (canScrape) {
        try {
            const card = await page.$x(`//*[@id="app"]/main/div[2]/section[2]/div[1]/div[${index}]/div[3]/a[1]`)
            let href = await (await card[0].getProperty("href")).jsonValue()
            links.push(href)
            index++

        } catch {
            console.log(pagina)
            try {
                let nextButton = await page.$x('//*[@id="app"]/main/div[2]/section[2]/nav[2]/button[2]')

                try {
                    await nextButton[0].click()
                    pagina++

                    if (pagina == 200) {
                        canScrape = false
                    }

                } catch {
                    index = 2
                }

                setTimeout(() => {

                }, 2000);
            } catch {
                index = 0
                canScrape = false
            }
        }
    }

    fs.writeFileSync("./linksdec.json", JSON.stringify(links))

    const linksopgehaald = JSON.parse(fs.readFileSync('linksdec.json'));
    let reviewfinal = [];
    try {
        for (let i = 0; i < linksopgehaald.length; i++) {
            const newUrl = linksopgehaald[i].replace('/p/', '/r/');
            await page.goto(newUrl);
            await page.waitForSelector('#reviews-floor'); 
            const reviewElems = await page.$$('#reviews-floor article'); 
            for (let j = 0; j < reviewElems.length; j++) {
                const reviewText = await reviewElems[j].$eval('p', el => el.innerText); 
                reviewfinal.push(reviewText); 
            }
        }
    } catch(e) {console.log(e)}
    
    const data = JSON.stringify(reviewfinal);
    fs.writeFileSync('reviewdeca.json', data);
    await browser.close()
    
})();