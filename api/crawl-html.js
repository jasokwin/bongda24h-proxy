import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing ?url=' });

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.content();
    await browser.close();

    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json({ html: content });
  } catch (err) {
    console.error('[Crawler Error]', err); // in log trên Vercel
    return res.status(500).json({ error: 'Crawling failed', details: err.message });
  }
}
