import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Listen to network requests
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`NETWORK ERROR: ${response.status()} ${response.url()}`);
    }
  });
  
  // Navigate to homepage first
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  console.log('Current page title:', await page.title());
  
  // Try to navigate to admin
  console.log('\nNavigating to admin page...');
  await page.goto('http://localhost:3000/admin');
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'admin-error.png' });
  console.log('Screenshot saved as admin-error.png');
  
  // Check what's displayed on the page
  const pageContent = await page.textContent('body');
  console.log('\nPage content preview:', pageContent.substring(0, 500));
  
  // Check if there's a login form
  const loginForm = await page.$('form');
  if (loginForm) {
    console.log('\nFound login form');
    const inputs = await page.$$('input');
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      console.log(`Input ${i}: type=${type}, placeholder=${placeholder}`);
    }
  }
  
  await browser.close();
})();