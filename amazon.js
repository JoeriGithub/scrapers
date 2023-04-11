const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = ['https://www.amazon.nl/Columbia-NEWTON-RIDGE-dames-Wandelschoen/product-reviews/B0BWQ51DVP/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews&pageNumber='
    , 'https://www.amazon.nl/Columbia-WOODBURN-WATERPROOF-heren-Wandelschoenen/product-reviews/B0BBH4SN46/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews&pageNumber='
    , 'https://www.amazon.nl/Merrell-Moab-Vent-Wandelschoen-dames/product-reviews/B07VFTXNGR/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews&pageNumber='
    , 'https://www.amazon.nl/Skechers-52811-Summits-52811-heren-Sneaker/product-reviews/B0B4GFQ6XS/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews&pageNumber='
];

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (let urlnumber = 0; urlnumber < urls.length; urlnumber++) {
        const currenturl = urls[urlnumber];
        const getPageUrl = (index) => `${currenturl}${index}`;

        let reviewData = [];
        let done = false;
        let index = 1;
        let pagesProcessed = 0;

        try {
            while (!done) {
                const pageUrl = getPageUrl(index);
                await page.goto(pageUrl, { waitUntil: 'networkidle0' });
                if (index == 1 && currenturl == urls[0]) {
                    const cookiebutton = await page.$x('//*[@id="sp-cc-accept"]')
                    await cookiebutton[0].click()
                }

                const reviewElems = await page.$$('.review');
                const reviewTexts = [];

                for (let i = 0; i < reviewElems.length; i++) {
                    const reviewElem = reviewElems[i];
                    const reviewTextElem = await reviewElem.$('.review-text-content');
                    const reviewText = await reviewTextElem.evaluate((el) => el.textContent);
                    console.log(reviewText);
                    reviewTexts.push(reviewText.replace(/\n/g, ''));
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
            fs.appendFileSync('reviewama.json', data);
        } catch (error) {
            console.error(error);
        }
    }
    await browser.close();
})();

