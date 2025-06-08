// Manual blog creation test
import { chromium } from 'playwright';

async function testBlogCreation() {
  console.log('🚀 Starting blog creation test...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to admin
    console.log('1. Navigating to admin panel...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Check if login form appears
    console.log('2. Checking for login form...');
    const loginForm = await page.locator('h3:has-text("Admin Login Required")');
    if (await loginForm.isVisible()) {
      console.log('✅ Login form visible');
      
      // Step 3: Login
      console.log('3. Logging in...');
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button:has-text("Login")');
      await page.waitForLoadState('networkidle');
      
      // Step 4: Check if logged in
      const welcomeText = await page.locator('text=Welcome, admin');
      if (await welcomeText.isVisible()) {
        console.log('✅ Successfully logged in');
        
        // Step 5: Test both admin routes to see which one works
        console.log('5. Testing admin/events route...');
        await page.goto('http://localhost:3000/admin/events');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('5.1. Current URL after admin/events:', page.url());
        
        console.log('5.2. Testing admin/blog route...');
        await page.goto('http://localhost:3000/admin/blog');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('5.3. Current URL after admin/blog:', page.url());
        
        // Try the link click approach too
        console.log('5.4. Going back to admin dashboard...');
        await page.goto('http://localhost:3000/admin');
        await page.waitForLoadState('networkidle');
        
        console.log('5.5. Clicking Manage Events...');
        const eventsLink = page.locator('text=Manage Events');
        if (await eventsLink.isVisible()) {
          await eventsLink.click();
          await page.waitForTimeout(1000);
          console.log('5.6. URL after events click:', page.url());
        }
        
        console.log('5.7. Going back to admin dashboard...');
        await page.goto('http://localhost:3000/admin');
        await page.waitForLoadState('networkidle');
        
        console.log('5.8. Clicking Manage Blog...');
        const blogLink = page.locator('text=Manage Blog');
        if (await blogLink.isVisible()) {
          await blogLink.click();
          await page.waitForTimeout(1000);
          console.log('5.9. URL after blog click:', page.url());
        }
        
        // Step 6: Verify URL changed to blog admin
        console.log('6. Checking URL...');
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/admin/blog')) {
          console.log('✅ Successfully navigated to blog admin');
          
          // Step 7: Wait for React Admin to fully load
          console.log('7. Waiting for React Admin interface...');
          await page.waitForTimeout(5000); // Give React Admin more time to load
          
          // Take screenshot to see what's actually rendered
          await page.screenshot({ path: 'admin-interface.png', fullPage: true });
          console.log('📸 Screenshot saved as admin-interface.png');
          
          // Check for React Admin specific elements first
          const reactAdminElements = [
            '.RaLayout-root',
            '.RaAppBar-root',
            '[data-testid="ra-appbar"]',
            '.RaList-root',
            'h1:has-text("Blog")',
            '.MuiAppBar-root'
          ];
          
          let reactAdminFound = false;
          for (const selector of reactAdminElements) {
            const element = page.locator(selector);
            if (await element.isVisible()) {
              console.log(`✅ Found React Admin element: ${selector}`);
              reactAdminFound = true;
              break;
            }
          }
          
          if (reactAdminFound) {
            // Check for various possible create buttons
            const createButtons = [
              'button:has-text("Create")',
              '[aria-label="Create"]',
              '[title="Create"]',
              'a:has-text("Create")',
              'button[type="button"]:has-text("Create")',
              '.ra-create-button',
              '[data-testid="create-button"]',
              'button:has-text("CREATE")',
              'span:has-text("CREATE")',
              '.MuiFab-root',
              '[role="button"]:has-text("Create")'
            ];
            
            let createButtonFound = false;
            for (const selector of createButtons) {
              const button = page.locator(selector);
              if (await button.isVisible()) {
                console.log(`✅ Found create button: ${selector}`);
                createButtonFound = true;
                
                // Try to click the create button
                console.log('8. Clicking create button...');
                await button.click();
                await page.waitForTimeout(2000);
                
                // Check if form appeared
                const formElements = [
                  'input[name="title"]',
                  'textarea[name="content"]',
                  'form',
                  '.RaCreate-root'
                ];
                
                for (const formSelector of formElements) {
                  const formElement = page.locator(formSelector);
                  if (await formElement.isVisible()) {
                    console.log(`✅ Blog creation form loaded: ${formSelector}`);
                    break;
                  }
                }
                
                break;
              }
            }
            
            if (!createButtonFound) {
              console.log('❌ No create button found in React Admin');
              // Log all visible buttons for debugging
              const buttons = await page.locator('button').all();
              console.log('Available buttons:');
              for (const button of buttons) {
                const text = await button.textContent();
                if (text && text.trim()) {
                  console.log(`  - "${text.trim()}"`);
                }
              }
              
              // Also check for links that might be create buttons
              const links = await page.locator('a').all();
              console.log('Available links:');
              for (const link of links) {
                const text = await link.textContent();
                if (text && text.trim()) {
                  console.log(`  - "${text.trim()}"`);
                }
              }
            }
          } else {
            console.log('❌ React Admin interface not found');
          }
        } else {
          console.log(`❌ URL did not change to blog admin. Current: ${currentUrl}`);
        }
        
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Login form not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  // Keep browser open for manual inspection
  console.log('🔍 Browser kept open for manual inspection...');
  await page.waitForTimeout(10000);
  await browser.close();
}

testBlogCreation();