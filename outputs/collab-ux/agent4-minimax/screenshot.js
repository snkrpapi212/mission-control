const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const desktopPage = await context.newPage();
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const mobilePage = await mobileContext.newPage();

  const outputDir = '/data/workspace/mission-control/outputs/collab-ux/agent4-minimax';

  // Capture login page
  console.log('Capturing login page (desktop)...');
  await desktopPage.goto('https://web-production-21ebe.up.railway.app/login');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.screenshot({ path: `${outputDir}/login-desktop.png`, fullPage: true });

  console.log('Capturing login page (mobile)...');
  await mobilePage.goto('https://web-production-21ebe.up.railway.app/login');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.screenshot({ path: `${outputDir}/login-mobile.png`, fullPage: true });

  // Capture dashboard
  console.log('Capturing dashboard (desktop)...');
  await desktopPage.goto('https://web-production-21ebe.up.railway.app/dashboard');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.screenshot({ path: `${outputDir}/dashboard-desktop.png`, fullPage: true });

  console.log('Capturing dashboard (mobile)...');
  await mobilePage.goto('https://web-production-21ebe.up.railway.app/dashboard');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.screenshot({ path: `${outputDir}/dashboard-mobile.png`, fullPage: true });

  await browser.close();
  console.log('Screenshots captured successfully!');
}

captureScreenshots().catch(console.error);
