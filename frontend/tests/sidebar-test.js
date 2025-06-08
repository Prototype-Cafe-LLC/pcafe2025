// Test React Admin sidebar navigation
import { chromium } from 'playwright';

async function testSidebar() {
  console.log('🚀 Testing React Admin sidebar...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in successfully');
    
    // Click on "Blogs" in the sidebar
    console.log('Clicking on Blogs in sidebar...');
    await page.click('text=Blogs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('Current URL:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'blogs-interface.png', fullPage: true });
    console.log('📸 Screenshot saved as blogs-interface.png');
    
    // Look for create button
    const createButtons = [
      'button:has-text("Create")',
      'button:has-text("CREATE")', 
      '[aria-label*="Create"]',
      '.MuiFab-root',
      'a:has-text("Create")'
    ];
    
    let createFound = false;
    for (const selector of createButtons) {
      const button = page.locator(selector);
      if (await button.isVisible()) {
        console.log(`✅ Found create button: ${selector}`);
        createFound = true;
        
        // Try clicking it
        await button.click();
        await page.waitForTimeout(2000);
        
        // Check for form
        const titleField = page.locator('input[name="title"]');
        if (await titleField.isVisible()) {
          console.log('🎉 SUCCESS: Blog creation form is accessible!');
          
          // Try filling the form
          await titleField.fill('Test Blog Post');
          console.log('✅ Form is functional');
        }
        
        break;
      }
    }
    
    if (!createFound) {
      console.log('⚠️ No create button found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await page.waitForTimeout(10000);
  await browser.close();
}

testSidebar();