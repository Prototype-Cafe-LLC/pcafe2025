// Simple routing test
import { chromium } from 'playwright';

async function testAdminRouting() {
  console.log('🚀 Testing admin routing...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login first
    console.log('1. Logging in...');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Wait for login to complete and check if we see the admin dashboard
    await page.waitForTimeout(2000);
    const welcomeText = await page.locator('text=Welcome, admin');
    if (await welcomeText.isVisible()) {
      console.log('✅ Login successful - dashboard visible');
    } else {
      console.log('❌ Login may have failed or dashboard not loaded');
    }
    
    // Test clicking the Manage Blog link (client-side routing)
    console.log('2. Testing Manage Blog link click...');
    const blogLink = page.locator('a:has-text("Manage Blog")');
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      const url = page.url();
      console.log(`URL after link click: ${url}`);
      
      if (url.includes('/admin/blog')) {
        console.log('✅ Link click routing works!');
      } else {
        console.log('❌ Link click routing failed');
        
        // Try direct navigation as backup
        console.log('3. Trying direct navigation to /admin/blog...');
        await page.goto('/admin/blog');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        const url2 = page.url();
        console.log(`URL after direct navigation: ${url2}`);
      }
    } else {
      console.log('❌ Manage Blog link not found');
    }
    
    const finalUrl = page.url();
    
    if (finalUrl.includes('/admin/blog')) {
      console.log('✅ Admin blog routing works!');
      
      // Take screenshot
      await page.screenshot({ path: 'admin-blog-interface.png' });
      console.log('📸 Screenshot saved');
      
      // Look for React Admin elements
      const adminElements = [
        '.RaLayout-root',
        '.MuiAppBar-root',
        'h1:has-text("Blog")',
        'button:has-text("Create")',
        '.RaList-root'
      ];
      
      for (const selector of adminElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          console.log(`✅ Found React Admin element: ${selector}`);
        }
      }
      
    } else {
      console.log(`❌ Routing failed. URL: ${url}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('🔍 Keeping browser open for 5 seconds...');
  await page.waitForTimeout(5000);
  await browser.close();
}

testAdminRouting();