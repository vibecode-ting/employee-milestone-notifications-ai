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
  console.log('Capturing 37_admin_user_role_modal.png...');
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

  await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table', { timeout: 6000 });

  // Enable button and click
  await page.evaluate(() => {
    const btn = document.querySelector('button[title*="Upgrade role"]');
    if (btn) {
      btn.disabled = false;
      btn.click();
    }
  });

  await page.waitForSelector('h3:has-text("Upgrade User Role")', { timeout: 5000 });
  await page.waitForTimeout(600);
  const filePath = path.join(OUT_DIR, '37_admin_user_role_modal.png');
  await page.screenshot({ path: filePath });
  console.log('Saved: 37_admin_user_role_modal.png');

  await browser.close();
}

run().catch((err) => {
  console.error('Error during 37 capture:', err);
  process.exit(1);
});
