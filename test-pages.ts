import { chromium } from 'playwright';

async function checkPages() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors: string[] = [];
  
  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  const pages = [
    { url: '/', name: 'Home' },
    { url: '/properties', name: 'Properties' },
    { url: '/owners', name: 'Owners' },
    { url: '/about', name: 'About' },
    { url: '/faq', name: 'FAQ' },
  ];

  console.log('Checking pages...\n');
  
  for (const p of pages) {
    try {
      await page.goto(`http://localhost:5173${p.url}`, { timeout: 15000, waitUntil: 'domcontentloaded' });
      console.log(`✅ ${p.name} (${p.url})`);
    } catch (err: any) {
      console.log(`❌ ${p.name} (${p.url}): ${err.message}`);
    }
  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS ---');
    errors.forEach(e => console.log(e));
  } else {
    console.log('\n✅ No critical errors!');
  }

  await browser.close();
}

checkPages().catch(console.error);
