// Debug routing with console logging
import { chromium } from 'playwright';

async function debugRouting() {
  console.log('🚀 Debug routing with console capture...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  // Capture errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]: ${error.message}`);
  });
  
  try {
    // Login first
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Login complete, current URL:', page.url());
    
    // Try client-side navigation by clicking link
    console.log('\n=== Testing Link Click ===');
    const blogLink = page.locator('a[href="/admin/blog"]');
    if (await blogLink.isVisible()) {
      console.log('Blog link found, clicking...');
      await blogLink.click();
      await page.waitForTimeout(3000);
      console.log('After click URL:', page.url());
    }
    
    console.log('\n=== Testing Direct Navigation ===');
    await page.goto('/admin/blog');
    await page.waitForTimeout(3000);
    console.log('After direct navigation URL:', page.url());
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  console.log('\nKeeping browser open for inspection...');
  await page.waitForTimeout(10000);
  await browser.close();
}

debugRouting();