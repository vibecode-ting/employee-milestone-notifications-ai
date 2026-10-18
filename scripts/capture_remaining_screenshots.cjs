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
  console.log('Launching browser for screenshots 30 through 39...');
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

  // 30. Feedback Modal (User role)
  console.log('30. Capturing Feedback Modal...');
  await setupState('user', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const feedbackBtn = page.locator('aside button:has-text("Feedback")').first();
  if (await feedbackBtn.isVisible()) {
    await feedbackBtn.click();
    await page.waitForSelector('h2:has-text("Submit App Feedback")', { timeout: 6000 });
    await take('30_feedback_modal.png', 600);
  }

  // 31. Admin Feedback Review Modal
  console.log('31. Capturing Admin Feedback Review Modal...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const reviewBtn = page.locator('aside button:has-text("Feedback Review")').first();
  if (await reviewBtn.isVisible()) {
    await reviewBtn.click();
    await page.waitForSelector('h2:has-text("Admin Feedback Review")', { timeout: 6000 });
    await take('31_admin_feedback_review_modal.png', 600);
  }

  // 32. Admin Sent Notifications Modal
  console.log('32. Capturing Admin Sent Notifications Modal...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const sentBtn = page.locator('aside button:has-text("Sent Notifications")').first();
  if (await sentBtn.isVisible()) {
    await sentBtn.click();
    await page.waitForSelector('h2:has-text("Sent Notifications")', { timeout: 6000 });
    await take('32_admin_sent_notifications_modal.png', 600);
  }

  // 33. Dashboard User Role
  console.log('33. Capturing Dashboard (User role)...');
  await setupState('user', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await take('33_dashboard_user_role.png', 800);

  // 34. Pricing Payment Checkout
  console.log('34. Capturing Pricing Payment Checkout...');
  await setupState('user', 'dark');
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Continue to Payment")', { timeout: 6000 });
  await page.click('button:has-text("Continue to Payment")');
  await page.waitForTimeout(800);
  await take('34_pricing_payment_checkout.png', 600);

  // 35. Settings Notifications Tab
  console.log('35. Capturing Settings (Notifications tab)...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Notifications")', { timeout: 5000 });
  await page.click('button:has-text("Notifications")');
  await page.waitForTimeout(600);
  await take('35_settings_notifications_tab.png', 600);

  // 36. Settings Templates Tab
  console.log('36. Capturing Settings (Templates tab)...');
  await page.click('button:has-text("Templates")');
  await page.waitForTimeout(600);
  await take('36_settings_templates_tab.png', 600);

  // 37. Admin User Role Modal
  console.log('37. Capturing Admin Users Role Upgrade Modal...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Upgrade")', { timeout: 6000 });
  const userUpgradeBtns = page.locator('button:has-text("Upgrade")');
  if (await userUpgradeBtns.count() > 0) {
    await userUpgradeBtns.first().click();
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

  console.log('All remaining screenshots (30-39) captured successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during screenshots 30-39 capture:', err);
  process.exit(1);
});
