if (typeof ReadableStream === 'undefined') {
    global.ReadableStream = require('web-streams-polyfill/ponyfill').ReadableStream;
}
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeMockups() {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://benditomockup.com/category/freebies'; // Updated to target the freebies page directly

    try {
        // Navigate to the target page
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Wait for product items to be loaded
        await page.waitForSelector('ul.products li.product', { timeout: 60000 }); // Adjust selector as needed

        // Get the page content
        const content = await page.content();
        const $ = cheerio.load(content);

        // Extract data using Cheerio
        let mockups = [];
        
        $('ul.products li.product').each((index, element) => {
            const title = $(element).find('h2.woocommerce-loop-product__title').text().trim();
            const description = $(element).find('p.description').text().trim();
            const format = $(element).find('span.my-custom-field').text().trim();
            const link = $(element).find('a').attr('href');
            const price = $(element).find('span.price').text().trim();
            const thumbnail = $(element).find('img').attr('src');
            // const source = url;

            mockups.push({
                title,
                description,
                format,
                link,
                price,
                thumbnail,
                source,
            });
        });

        // Output data to a JSON file
        fs.writeFileSync('mockups.json', JSON.stringify(mockups, null, 2));
        console.log('Scraping completed! Data saved to mockups.json');

    } catch (error) {
        console.error('Error scraping mockups:', error);
    } finally {
        await browser.close();
    }
}

scrapeMockups();