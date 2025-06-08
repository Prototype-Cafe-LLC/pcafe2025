// Final comprehensive blog creation test
import { chromium } from 'playwright';

async function testBlogCreation() {
  console.log('🚀 Final blog creation test...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    // Login
    console.log('1. Logging in...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Check dashboard loaded
    await page.waitForTimeout(2000);
    const welcomeText = await page.locator('text=Welcome, admin');
    if (await welcomeText.isVisible()) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
      return;
    }
    
    // Navigate to blog management
    console.log('2. Navigating to blog management...');
    await page.click('text=Manage Blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/admin/blog') || currentUrl.includes('/admin')) {
      console.log('✅ Successfully navigated to admin interface');
      
      // Take screenshot of current state
      await page.screenshot({ path: 'final-admin-interface.png', fullPage: true });
      console.log('📸 Screenshot saved as final-admin-interface.png');
      
      // Look for any create/add buttons
      console.log('3. Looking for create buttons...');
      
      const createSelectors = [
        'button:has-text("Create")',
        'button:has-text("Add")', 
        'button:has-text("New")',
        '[aria-label*="Create"]',
        '[title*="Create"]',
        'a:has-text("Create")',
        '.MuiFab-root',
        'button[type="button"]:has-text("CREATE")',
        'span:has-text("CREATE")'
      ];
      
      let createButtonFound = false;
      for (const selector of createSelectors) {
        const button = page.locator(selector).first();
        if (await button.isVisible()) {
          console.log(`✅ Found create button: ${selector}`);
          createButtonFound = true;
          
          try {
            console.log('4. Clicking create button...');
            await button.click();
            await page.waitForTimeout(3000);
            
            // Check if a form appeared
            const formFields = [
              'input[name="title"]',
              'textarea[name="content"]',
              'input[placeholder*="title"]',
              'textarea[placeholder*="content"]'
            ];
            
            let formFound = false;
            for (const field of formFields) {
              const input = page.locator(field).first();
              if (await input.isVisible()) {
                console.log(`✅ Found form field: ${field}`);
                formFound = true;
                break;
              }
            }
            
            if (formFound) {
              console.log('🎉 SUCCESS: Blog creation form is accessible!');
            } else {
              console.log('⚠️ Create button clicked but no form found');
            }
            
          } catch (error) {
            console.log(`❌ Error clicking create button: ${error.message}`);
          }
          
          break;
        }
      }
      
      if (!createButtonFound) {
        console.log('⚠️ No create button found');
        
        // Log all visible elements for debugging
        console.log('Available buttons:');
        const buttons = await page.locator('button').all();
        for (const button of buttons.slice(0, 10)) { // Limit to first 10
          const text = await button.textContent();
          if (text && text.trim()) {
            console.log(`  - "${text.trim()}"`);
          }
        }
        
        console.log('Available links:');
        const links = await page.locator('a').all();
        for (const link of links.slice(0, 10)) { // Limit to first 10
          const text = await link.textContent();
          if (text && text.trim()) {
            console.log(`  - "${text.trim()}"`);
          }
        }
      }
      
    } else {
      console.log(`❌ Navigation failed. URL: ${currentUrl}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('🔍 Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);
  await browser.close();
}

testBlogCreation();