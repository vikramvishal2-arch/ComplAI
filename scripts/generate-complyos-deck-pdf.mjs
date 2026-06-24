/**
 * Generates docs/complyos-ciso-deck.pdf from the HTML deck — run: npm run deck:pdf
 */
import puppeteer from 'puppeteer';
import { existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML = join(__dirname, '..', 'docs', 'complyos-ciso-deck.html');
const OUT = join(__dirname, '..', 'docs', 'complyos-ciso-deck.pdf');

const BROWSER_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findBrowser() {
  return BROWSER_CANDIDATES.find((p) => existsSync(p));
}

function printViaCli(browserPath) {
  const result = spawnSync(
    browserPath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=10000',
      `--print-to-pdf=${OUT}`,
      pathToFileURL(HTML).href,
    ],
    { stdio: 'inherit', windowsHide: true }
  );
  if (result.status !== 0 || !existsSync(OUT)) {
    throw new Error(`Browser PDF export failed (exit ${result.status ?? 'unknown'})`);
  }
  console.log(`Created ${OUT}`);
}

const browserPath = findBrowser();
if (browserPath) {
  printViaCli(browserPath);
} else {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 120000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(HTML).href, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.emulateMediaType('print');
    await page.pdf({
      path: OUT,
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    console.log(`Created ${OUT}`);
  } finally {
    await browser.close();
  }
}
