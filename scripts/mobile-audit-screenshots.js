const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'https://web-production-21ebe.up.railway.app/dashboard';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './outputs/review/mobile-audit-screenshots';

// Viewport sizes to test
const viewports = [
  { name: 'iphone', width: 390, height: 844 },
  { name: 'iphone-pro', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  
  for (const viewport of viewports) {
    console.log(`\n=== Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
    
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2
    });
    
    const page = await context.newPage();
    
    try {
      // 1. Dashboard initial load
      console.log('Loading dashboard...');
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      await delay(2000);
      await page.screenshot({ 
        path: path.join(OUTPUT_DIR, `${viewport.name}-01-dashboard-load.png`),
        fullPage: true 
      });
      console.log('✓ Dashboard load captured');

      // 2. Mobile nav open - try to find hamburger or menu button
      try {
        // Look for menu button (usually first button with SVG)
        const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
        await menuButton.click({ timeout: 5000 });
        await delay(1000);
        await page.screenshot({ 
          path: path.join(OUTPUT_DIR, `${viewport.name}-02-nav-open.png`),
          fullPage: true 
        });
        console.log('✓ Nav open captured');
        // Close menu
        await page.keyboard.press('Escape');
        await delay(500);
      } catch (e) {
        console.log('  Could not find/click menu button');
      }

      // 3. Agents tab/view
      try {
        const agentsTab = page.locator('button, a').filter({ hasText: /Agents/i }).first();
        await agentsTab.click({ timeout: 5000 });
        await delay(1500);
        await page.screenshot({ 
          path: path.join(OUTPUT_DIR, `${viewport.name}-03-agents-tab.png`),
          fullPage: true 
        });
        console.log('✓ Agents tab captured');
      } catch (e) {
        console.log('  Could not navigate to Agents tab');
      }

      // Go back to dashboard for other screenshots
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      await delay(1500);

      // 4. Add Task modal in dark mode
      // First enable dark mode
      try {
        const darkToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
        await darkToggle.click({ timeout: 3000 });
        await delay(1000);
      } catch (e) {
        // Force dark mode via JS
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        });
      }
      
      // Open Add Task modal
      try {
        const addTaskBtn = page.locator('button').filter({ hasText: /New Task|Add Task/i }).first();
        await addTaskBtn.click({ timeout: 5000 });
        await delay(1500);
        await page.screenshot({ 
          path: path.join(OUTPUT_DIR, `${viewport.name}-04-add-task-dark.png`),
          fullPage: true 
        });
        console.log('✓ Add Task modal (dark) captured');
        await page.keyboard.press('Escape');
        await delay(500);
      } catch (e) {
        console.log('  Could not open Add Task modal');
      }

      // 5. Task detail modal/drawer - try clicking a task card
      try {
        const taskCard = page.locator('[class*="card"], [class*="task"], [role="listitem"]').first();
        await taskCard.click({ timeout: 5000 });
        await delay(1500);
        await page.screenshot({ 
          path: path.join(OUTPUT_DIR, `${viewport.name}-05-task-detail.png`),
          fullPage: true 
        });
        console.log('✓ Task detail captured');
        await page.keyboard.press('Escape');
        await delay(500);
      } catch (e) {
        console.log('  Could not open task detail');
      }

      // Reset to light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      });

      // 6. Documents tab + open document view
      try {
        // Try to find docs button (might be hidden on mobile)
        const docsBtn = page.locator('button, a').filter({ hasText: /Docs|Documents/i }).first();
        await docsBtn.click({ timeout: 5000 });
        await delay(1500);
        await page.screenshot({ 
          path: path.join(OUTPUT_DIR, `${viewport.name}-06a-documents-tab.png`),
          fullPage: true 
        });
        console.log('✓ Documents tab captured');
        
        // Try to open a document
        const docItem = page.locator('[class*="document"], [class*="file"], tr').first();
        await docItem.click({ timeout: 5000 });
        await delay(1500);
        await page.screenshot({ 
          path: path.join(OUTPUT_DIR, `${viewport.name}-06b-document-view.png`),
          fullPage: true 
        });
        console.log('✓ Document view captured');
      } catch (e) {
        console.log('  Could not navigate to Documents tab');
      }

    } catch (error) {
      console.error(`Error with viewport ${viewport.name}:`, error.message);
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('\n=== Screenshot capture complete ===');
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

captureScreenshots().catch(console.error);
