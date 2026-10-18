const { chromium } = require('playwright');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'screenshot');
const BASE_URL = 'http://localhost:5173';

function getDemoSession(role = 'admin') {
  return JSON.stringify({
    uid: 'demo-uid',
    email: 'demo@milestone.app',
    role,
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: null,
  });
}

async function run() {
  console.log('Recapturing 35_settings_notifications_tab.png...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ session }) => {
    localStorage.setItem('demo_session', session);
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('sidebar_pinned', 'true');
    document.documentElement.classList.add('dark');
  }, { session: getDemoSession('admin') });

  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Notification Settings")', { timeout: 6000 });
  await page.click('button:has-text("Notification Settings")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '35_settings_notifications_tab.png') });
  console.log('Saved: 35_settings_notifications_tab.png');

  await browser.close();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
