const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchPage(url, outputPath) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    let html = await page.content();
    
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<link rel="preload" as="script"[^>]*>/gi, '');
    html = html.replace(/<link rel="modulepreload"[^>]*>/gi, '');
    html = html.replace(/<link rel="stylesheet" href="\/_next\/static\/css\/[^"]+"[^>]*>/gi, '<link rel="stylesheet" href="/style.css"/>');

    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`Saved to ${outputPath}`);
    await browser.close();
}

const url = process.argv[2];
const output = process.argv[3];
if(url && output) fetchPage(url, output).catch(console.error);
