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
  console.log('Launching browser for screenshots 37, 38, 39...');
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

  async function setupState(role = 'admin', theme = 'dark') {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(({ session, th }) => {
      localStorage.setItem('demo_session', session);
      localStorage.setItem('theme', th);
      localStorage.setItem('sidebar_pinned', 'true');
      if (th === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, { session: getDemoSession(role), th: theme });
  }

  async function take(name, waitMs = 500) {
    await page.waitForTimeout(waitMs);
    const filePath = path.join(OUT_DIR, name);
    await page.screenshot({ path: filePath });
    console.log(`Saved: ${name}`);
  }

  // 37. Admin User Role Modal
  console.log('37. Capturing Admin Users Role Upgrade Modal...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table', { timeout: 6000 });
  const enabledUpgradeBtn = page.locator('button:has-text("Upgrade"):not([disabled])').first();
  if (await enabledUpgradeBtn.isVisible()) {
    await enabledUpgradeBtn.click();
    await page.waitForSelector('h3:has-text("Upgrade User Role")', { timeout: 5000 });
    await take('37_admin_user_role_modal.png', 600);
  }

  // 38. Employees Light Theme
  console.log('38. Capturing Employees (Light theme)...');
  await setupState('pro', 'light');
  await page.goto(`${BASE_URL}/employees`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table', { timeout: 6000 });
  await take('38_employees_light_theme.png', 800);

  // 39. Dashboard Light Theme
  console.log('39. Capturing Dashboard (Light theme)...');
  await setupState('admin', 'light');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await take('39_dashboard_light_theme.png', 800);

  console.log('Screenshots 37-39 captured successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during 37-39 capture:', err);
  process.exit(1);
});
