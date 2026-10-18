const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

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
  console.log('Launching browser...');
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

  // Helper to set role and theme
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

  // 12. Employees - Free Role
  console.log('12. Capturing Employees (Free role)...');
  await setupState('user', 'dark');
  await page.goto(`${BASE_URL}/employees`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table', { timeout: 6000 });
  await take('12_employees_free_role.png', 800);

  // 13. Employees - Free Role Database Locked Modal
  console.log('13. Capturing Database Locked Modal (Free role)...');
  await page.click('button:has-text("Database Connection")');
  await page.waitForSelector('text=Database Connector is a Paid Feature', { timeout: 4000 });
  await take('13_employees_free_db_locked_modal.png', 500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 14. Employees - Pro Role
  console.log('14. Capturing Employees (Pro role)...');
  await setupState('pro', 'dark');
  await page.goto(`${BASE_URL}/employees`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table', { timeout: 6000 });
  await take('14_employees_pro_role.png', 800);

  // 15. Pro Role - Database Connection (PostgreSQL preloaded)
  console.log('15. Capturing Pro Database Modal (PostgreSQL)...');
  await page.click('button:has-text("Database Connection")');
  await page.waitForSelector('text=Connect Database', { timeout: 4000 });
  await take('15_employees_pro_db_postgres.png', 500);

  // 16. Pro Role - Database Connection (MySQL)
  console.log('16. Capturing Pro Database Modal (MySQL)...');
  await page.click('button:has-text("MySQL")');
  await page.waitForTimeout(300);
  await take('16_employees_pro_db_mysql.png', 300);

  // 17. Pro Role - Database Connection (Supabase)
  console.log('17. Capturing Pro Database Modal (Supabase)...');
  await page.click('button:has-text("Supabase")');
  await page.waitForTimeout(300);
  await take('17_employees_pro_db_supabase.png', 300);

  // 18. Pro Role - Database Connection (MongoDB)
  console.log('18. Capturing Pro Database Modal (MongoDB)...');
  await page.click('button:has-text("MongoDB")');
  await page.waitForTimeout(300);
  await take('18_employees_pro_db_mongodb.png', 300);

  // 19. Pro Role - Database Connection (SQL Server)
  console.log('19. Capturing Pro Database Modal (SQL Server)...');
  await page.click('button:has-text("SQL Server")');
  await page.waitForTimeout(300);
  await take('19_employees_pro_db_sqlserver.png', 300);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 20. Employees - Ultra Role
  console.log('20. Capturing Employees (Ultra role)...');
  await setupState('pro_plus', 'dark');
  await page.goto(`${BASE_URL}/employees`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table', { timeout: 6000 });
  await take('20_employees_ultra_role.png', 800);

  // 21. Employees - Ultra Role Database Modal
  console.log('21. Capturing Database Modal (Ultra role)...');
  await page.click('button:has-text("Database Connection")');
  await page.waitForSelector('text=Connect Database', { timeout: 4000 });
  await take('21_employees_ultra_db_modal.png', 500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 22. Employees - Admin Role
  console.log('22. Capturing Employees (Admin role)...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/employees`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table', { timeout: 6000 });
  await take('22_employees_admin_role.png', 800);

  // 23. Add Employee Modal
  console.log('23. Capturing Add Employee Modal...');
  await page.click('button:has-text("Add Employee")');
  await page.waitForSelector('h2:has-text("Add Employee")', { timeout: 4000 });
  await take('23_employees_add_modal.png', 500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 24. Edit Employee Modal
  console.log('24. Capturing Edit Employee Modal...');
  const editButtons = page.locator('button[title*="Edit"]');
  if (await editButtons.count() > 0) {
    await editButtons.first().click();
    await page.waitForSelector('h2:has-text("Edit Employee")', { timeout: 4000 });
    await take('24_employees_edit_modal.png', 500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // 25. Custom Columns Modal
  console.log('25. Capturing Custom Columns Modal...');
  await page.click('button:has-text("Custom Columns")');
  await page.waitForSelector('text=Custom Columns Management', { timeout: 4000 });
  await take('25_employees_custom_columns_modal.png', 500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 26. Tier Comparison Modal
  console.log('26. Capturing Tier Comparison Modal...');
  // Open via Custom Columns upgrade badge or trigger
  await page.click('button:has-text("Custom Columns")');
  await page.waitForSelector('text=Custom Columns Management', { timeout: 4000 });
  const upgradeBadge = page.locator('button:has-text("Upgrade to unlock")').first();
  if (await upgradeBadge.isVisible()) {
    await upgradeBadge.click();
  } else {
    // If not visible or already unlocked, evaluate opening tier modal directly
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await setupState('user', 'dark');
    await page.goto(`${BASE_URL}/employees`, { waitUntil: 'domcontentloaded' });
    await page.click('button:has-text("Custom Columns")');
    await page.waitForSelector('text=Custom Columns Management', { timeout: 4000 });
    await page.locator('button:has-text("Upgrade to unlock")').first().click();
  }
  await page.waitForSelector('text=Unlock Advanced HR Power', { timeout: 5000 });
  await take('26_tier_comparison_modal.png', 600);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 27. AI Card Studio Modal
  console.log('27. Capturing AI Card Studio Modal...');
  await setupState('pro', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("AI Card Studio")', { timeout: 6000 });
  await page.click('button:has-text("AI Card Studio")');
  await page.waitForSelector('text=Milestone AI Studio', { timeout: 5000 });
  await take('27_dashboard_ai_card_studio.png', 800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 28. Copilot Sidebar Open
  console.log('28. Capturing Copilot Sidebar...');
  await page.click('button:has-text("HR Copilot")');
  await page.waitForSelector('text=Workforce Intelligence', { timeout: 5000 });
  await take('28_copilot_sidebar.png', 800);
  // close copilot
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 29. Notifications Flyout
  console.log('29. Capturing Notifications Flyout...');
  const notifBtn = page.locator('aside button:has-text("Notifications"), aside button[aria-label="Notifications"]').first();
  if (await notifBtn.isVisible()) {
    await notifBtn.click();
    await page.waitForTimeout(400);
    await take('29_notifications_flyout.png', 500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 30. Feedback Modal (User role)
  console.log('30. Capturing Feedback Modal...');
  await setupState('user', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  const feedbackBtn = page.locator('aside button:has-text("Feedback")').first();
  if (await feedbackBtn.isVisible()) {
    await feedbackBtn.click();
    await page.waitForSelector('text=Send Feedback', { timeout: 4000 });
    await take('30_feedback_modal.png', 500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 31. Admin Feedback Review Modal
  console.log('31. Capturing Admin Feedback Review Modal...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  const reviewBtn = page.locator('aside button:has-text("Feedback Review")').first();
  if (await reviewBtn.isVisible()) {
    await reviewBtn.click();
    await page.waitForSelector('text=Feedback Review', { timeout: 4000 });
    await take('31_admin_feedback_review_modal.png', 500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 32. Admin Sent Notifications Modal
  console.log('32. Capturing Admin Sent Notifications Modal...');
  const sentBtn = page.locator('aside button:has-text("Sent Notifications")').first();
  if (await sentBtn.isVisible()) {
    await sentBtn.click();
    await page.waitForSelector('text=Sent Notifications', { timeout: 4000 });
    await take('32_admin_sent_notifications_modal.png', 500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 33. Dashboard User Role
  console.log('33. Capturing Dashboard (User role)...');
  await setupState('user', 'dark');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await take('33_dashboard_user_role.png', 800);

  // 34. Pricing Payment Checkout
  console.log('34. Capturing Pricing Payment Checkout...');
  await setupState('user', 'dark');
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Choose the Right Plan', { timeout: 6000 });
  const selectPlanBtns = page.locator('button:has-text("Select Plan")');
  if (await selectPlanBtns.count() > 0) {
    await selectPlanBtns.first().click();
    await page.waitForTimeout(600);
    await take('34_pricing_payment_checkout.png', 600);
  }

  // 35. Settings Notifications Tab
  console.log('35. Capturing Settings (Notifications tab)...');
  await setupState('admin', 'dark');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Notifications")', { timeout: 5000 });
  await page.click('button:has-text("Notifications")');
  await page.waitForTimeout(500);
  await take('35_settings_notifications_tab.png', 600);

  // 36. Settings Templates Tab
  console.log('36. Capturing Settings (Templates tab)...');
  await page.click('button:has-text("Templates")');
  await page.waitForTimeout(500);
  await take('36_settings_templates_tab.png', 600);

  // 37. Admin User Role Modal
  console.log('37. Capturing Admin Users Role Upgrade Modal...');
  await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Upgrade")', { timeout: 6000 });
  const userUpgradeBtns = page.locator('button:has-text("Upgrade")');
  if (await userUpgradeBtns.count() > 0) {
    await userUpgradeBtns.first().click();
    await page.waitForSelector('text=Upgrade User Plan', { timeout: 4000 });
    await take('37_admin_user_role_modal.png', 600);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
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
  await page.waitForTimeout(1000);
  await take('39_dashboard_light_theme.png', 800);

  console.log('All screenshots captured successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
