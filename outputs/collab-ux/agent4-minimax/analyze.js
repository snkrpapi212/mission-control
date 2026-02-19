const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyzePages() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const outputDir = '/data/workspace/mission-control/outputs/collab-ux/agent4-minimax';

  // Analyze login page
  console.log('Analyzing login page...');
  await page.goto('https://web-production-21ebe.up.railway.app/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for any dynamic content

  const loginContent = await page.evaluate(() => {
    return {
      title: document.title,
      h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
      h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
      labels: Array.from(document.querySelectorAll('label')).map(l => l.textContent.trim()),
      buttons: Array.from(document.querySelectorAll('button, input[type="submit"], .btn')).map(b => ({
        text: b.textContent.trim(),
        type: b.type
      })),
      inputs: Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type,
        placeholder: i.placeholder,
        name: i.name
      })),
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent.trim(),
        href: a.href
      })),
      textContent: document.body.innerText.substring(0, 2000),
      classNames: Array.from(new Set(Array.from(document.querySelectorAll('*')).map(el => el.className).filter(c => c)))
    };
  });

  fs.writeFileSync(`${outputDir}/login-analysis.json`, JSON.stringify(loginContent, null, 2));

  // Analyze dashboard
  console.log('Analyzing dashboard...');
  await page.goto('https://web-production-21ebe.up.railway.app/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const dashboardContent = await page.evaluate(() => {
    return {
      title: document.title,
      h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
      h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
      h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim()),
      labels: Array.from(document.querySelectorAll('label')).map(l => l.textContent.trim()),
      buttons: Array.from(document.querySelectorAll('button, input[type="submit"], .btn')).map(b => ({
        text: b.textContent.trim(),
        type: b.type
      })),
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent.trim(),
        href: a.href
      })),
      navItems: Array.from(document.querySelectorAll('nav a, .nav-item, .sidebar a, .menu-item')).map(n => ({
        text: n.textContent.trim(),
        href: n.href
      })),
      cards: Array.from(document.querySelectorAll('.card, .widget, .stat, .metric, [class*="card"], [class*="stat"]')).map(c => ({
        title: c.querySelector('h1, h2, h3, h4, .title, .header')?.textContent?.trim() || '',
        content: c.innerText.substring(0, 100)
      })),
      textContent: document.body.innerText.substring(0, 3000)
    };
  });

  fs.writeFileSync(`${outputDir}/dashboard-analysis.json`, JSON.stringify(dashboardContent, null, 2));

  await browser.close();
  console.log('Analysis complete!');
}

analyzePages().catch(console.error);
