// Simple dashboard test
import { chromium } from 'playwright';

async function testDashboard() {
  console.log('🚀 Testing dashboard...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: 'dashboard-state.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
    // Log page content
    const content = await page.content();
    console.log('Page title:', await page.title());
    console.log('URL:', page.url());
    
    // Check for specific text
    const hasDashboard = await page.locator('text=Admin Dashboard').isVisible();
    const hasBlogText = await page.locator('text=Blog Management').isVisible();
    const hasManageButton = await page.locator('button:has-text("Manage Blog")').isVisible();
    
    console.log('Has "Admin Dashboard":', hasDashboard);
    console.log('Has "Blog Management":', hasBlogText);
    console.log('Has "Manage Blog" button:', hasManageButton);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
}

testDashboard();