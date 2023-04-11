const fs = require('fs');

const reviewsDataama = fs.readFileSync('reviewama.json');
const reviewsama = JSON.parse(reviewsDataama);

const reviewsDatadeca = fs.readFileSync('reviewdeca.json');
const reviewsdeca = JSON.parse(reviewsDatadeca);

const reviewsDatabol = fs.readFileSync('reviewdeca.json');
const reviewsbol = JSON.parse(reviewsDatabol);

var combinedData = reviewsama.concat(reviewsbol);
combinedData = combinedData.concat(reviewsdeca);
fs.writeFileSync('combinedData.json', JSON.stringify(combinedData));

const imgDataama = fs.readFileSync('imgsama.json');
const imagesama = JSON.parse(imgDataama);

const imgDatadeca = fs.readFileSync('imgsdec.json');
const imagesdeca = JSON.parse(imgDatadeca);

const combinedimgs = imagesama.concat(imagesdeca);
fs.writeFileSync('combinedImgs.json', JSON.stringify(combinedimgs));

let totalReviews = combinedData.length;
let longReviews = 0;
let totalWords = 0;

combinedData.forEach(review => {
    const words = review.split(' ').length;
    totalWords += words;

    if (words > 100) {
        longReviews++;
    }
});

const avgWords = totalWords / totalReviews;

console.log(`Total amount of reviews: ${totalReviews}`);
console.log(`Amount of reviews over 100 words: ${longReviews}`);
console.log(`Average words per review: ${avgWords}`);

console.log(`Number of images: ${combinedimgs.length}`);
