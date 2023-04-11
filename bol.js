const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = ['https://www.bol.com/nl/nl/p/grisport-sherpa-wandelschoenen-unisex-black-maat-43/9200000057761973/'
    , 'https://www.bol.com/nl/nl/p/grisport-torino-mid-wandelschoenen-unisex-grey-maat-45/9200000092748777/'
];

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (let urlnumber = 0; urlnumber < urls.length; urlnumber++) {
        const currenturl = urls[urlnumber];

        let reviewData = [];
        let done = false;
        let pagesProcessed = 0;

        try {
            while (!done) {
                const pageUrl = currenturl;
                await page.goto(pageUrl, { waitUntil: 'networkidle0' });
                if (urls[urlnumber] == urls[0]) {
                    const cookiebutton = await page.$x('//*[@id="js-first-screen-accept-all-button"]', { waitUntil: 'networkidle0' })
                    await cookiebutton[0].click()
                }

                await page.waitForTimeout(1000);

                let toonmeer = await page.$x('//*[@id="show-more-reviews"]', { waitUntil: 'networkidle0' })
                try {
                    while (toonmeer.length > 0) {
                        toonmeer = await page.$x('//*[@id="show-more-reviews"]')
                        await toonmeer[0].click()
                        await page.waitForTimeout(1000);
                    }
                } catch (error) { }


                const reviewElems = await page.$$('p[data-test="review-body"]');

                const reviewTexts = [];
                console.log(reviewElems.length)

                for (let i = 0; i < reviewElems.length; i++) {
                    const reviewElem = reviewElems[i];
                    const reviewText = await reviewElem.evaluate((el) => el.textContent);
                    console.log(reviewText);
                    reviewTexts.push(reviewText);
                }

                reviewData = [...reviewData, ...reviewTexts];
                pagesProcessed++;

                if (pagesProcessed % 100 === 0) {
                    const data = JSON.stringify(reviewData);
                    fs.appendFileSync('reviewama.json', data);
                    reviewData = [];
                }

                const nextButton = await page.$('.a-last > a');
                if (nextButton) {
                    index++;
                } else {
                    done = true;
                }
            }

            const data = JSON.stringify(reviewData);
            fs.appendFileSync('reviewbol.json', data);
            
        } catch (error) {
            console.error(error);
        }
    }
    await browser.close();
})();