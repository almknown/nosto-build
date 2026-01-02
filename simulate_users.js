
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Configuration
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3000'; // Testing local build to ensure it matches code
const SCREENSHOT_DIR = 'user_simulation_logs';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR);
}

async function runPersona(name, viewport, actions) {
    console.log(`\n--- Starting Persona: ${name} ---`);
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport(viewport);

    // Capture logs
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[Browser Error] ${err.toString()}`));

    try {
        await page.goto(URL, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}_0_landing.png`) });

        await actions(page);

        console.log(`--- Persona ${name} Completed Successfully ---`);
    } catch (e) {
        console.error(`!!! Persona ${name} FAILED:`, e);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}_ERROR.png`) });
    } finally {
        await browser.close();
    }
}

async function runAll() {
    // Persona 1: The Newbie (Search & Click)
    await runPersona('Newbie', { width: 1366, height: 768 }, async (page) => {
        console.log('Action: Searching for "Pianta"...');
        const input = await page.waitForSelector('input[type="text"]');
        await input.type('Pianta');
        await page.keyboard.press('Enter');

        console.log('Action: Waiting for results...');
        await page.waitForSelector('button h3', { timeout: 10000 }); // Wait for results
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Newbie_1_search_results.png') });

        console.log('Action: Selecting channel...');
        await page.click('button h3'); // Click first result

        // Wait for next step (Indexing or Filter)
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Newbie_2_selection.png') });
    });

    // Persona 2: The Power User (Filters)
    await runPersona('PowerUser', { width: 1920, height: 1080 }, async (page) => {
        // ... Skip search setup, assuming flow ...
        // For simulation speed, we'll assume we can navigate directly if URL supported, 
        // but app is SPA. So we must repeat search.
        await page.waitForSelector('input[type="text"]');
        await page.type('input[type="text"]', 'Pianta');
        await page.keyboard.press('Enter');
        await page.waitForSelector('button h3');
        await page.click('button h3');

        // Wait for Filter Panel (assuming indexing complete or fast)
        try {
            await page.waitForSelector('text/Your Filters', { timeout: 5000 });
        } catch (e) {
            // Might be indexing. Wait longer.
            console.log('Waiting for indexing...');
            await page.waitForNetworkIdle({ timeout: 10000 });
        }

        // Interact with Filters
        console.log('Action: Setting Year Filter 2018-2019');
        // Note: Inputs might have specific IDs or classes. Using placeholder for now if specific selectors unknown, 
        // but based on code: inputs are type="number".
        // We'll just take a screenshot of the filter panel to "observe" it.
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'PowerUser_1_filter_panel.png') });

        // Click Generate
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('Generate')) {
                console.log('Action: Clicking Generate');
                await btn.click();
                break;
            }
        }

        await new Promise(r => setTimeout(r, 5000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'PowerUser_2_results.png') });
    });

    // Persona 3: The Vibe Seeker (AI Topic)
    await runPersona('VibeSeeker', { width: 1440, height: 900 }, async (page) => {
        await page.type('input[type="text"]', 'Boy Boy');
        await page.keyboard.press('Enter');
        await page.waitForSelector('button h3');
        await page.click('button h3');

        await new Promise(r => setTimeout(r, 2000));

        // Input Topic
        console.log('Action: Typing Topic "Iran"...');
        // Assuming the textarea or input for topic has a placeholder containing "topic" or similar
        // Or we finding the specific input. Based on code `FilterPanel`, it's a textarea or input.
        const inputs = await page.$$('textarea'); // Topic is usually textarea
        if (inputs.length > 0) {
            await inputs[0].type('Iran related videos');
        } else {
            console.log('Could not find Topic input!');
        }

        // Generate
        await new Promise(r => setTimeout(r, 1000));
        const genBtn = (await page.$$('button')).pop(); // Usually last button
        await genBtn.click();

        await new Promise(r => setTimeout(r, 8000)); // AI takes longer
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'VibeSeeker_1_ai_results.png') });
    });

    // Persona 4: The Impatient User (Cancel Flow)
    await runPersona('Impatient', { width: 1280, height: 800 }, async (page) => {
        await page.type('input[type="text"]', 'Mark Rober'); // Large channel, good for indexing test
        await page.keyboard.press('Enter');
        await page.waitForSelector('button h3');
        await page.click('button h3');

        // Should see indexing
        await new Promise(r => setTimeout(r, 500));
        console.log('Action: Checking for Cancel Button');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Impatient_1_indexing.png') });

        // Click Cancel
        const buttons = await page.$$('button');
        let clicked = false;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('Cancel')) {
                await btn.click();
                clicked = true;
                console.log('Action: Clicked Cancel');
                break;
            }
        }

        if (!clicked) console.log('Cancel button not found!');

        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Impatient_2_after_cancel.png') });
    });

    // Persona 5: Mobile User (Responsiveness)
    await runPersona('MobileUser', { width: 375, height: 667, isMobile: true }, async (page) => {
        console.log('Action: Viewing on iPhone SE size');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Mobile_1_landing.png') });

        // Search
        await page.type('input[type="text"]', 'Pianta');
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'Mobile_2_results.png') });
    });
}

runAll();
