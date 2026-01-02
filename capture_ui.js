
const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true, // Use headless mode for speed
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to localhost...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        console.log('Capturing Landing Page...');
        await page.screenshot({ path: 'local_ui_landing.png' });

        console.log('Done!');
        await browser.close();
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();
