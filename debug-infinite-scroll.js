const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://the-internet.herokuapp.com/infinite_scroll');
  
  // Get detailed structure of the .example div
  const structure = await page.evaluate(() => {
    const example = document.querySelector('.example');
    if (!example) return { error: 'No .example found' };
    
    // Look for any elements that contain the scroll content
    const allElements = example.querySelectorAll('*');
    const elements = Array.from(allElements).map(el => ({
      tag: el.tagName,
      classes: el.className,
      id: el.id,
      text: el.textContent?.substring(0, 100).trim(),
      childCount: el.children.length
    }));
    
    return {
      exampleHTML: example.innerHTML.substring(0, 500),
      elements: elements.slice(0, 20) // First 20 elements
    };
  });
  
  console.log('Initial structure:', JSON.stringify(structure, null, 2));
  
  // Scroll down
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(3000);
  
  // Check again after scroll
  const afterScroll = await page.evaluate(() => {
    const example = document.querySelector('.example');
    if (!example) return { error: 'No .example found' };
    
    const allElements = example.querySelectorAll('*');
    const elements = Array.from(allElements).map(el => ({
      tag: el.tagName,
      classes: el.className,
      id: el.id,
      text: el.textContent?.substring(0, 100).trim(),
      childCount: el.children.length
    }));
    
    return {
      exampleHTML: example.innerHTML.substring(0, 500),
      elements: elements.slice(0, 20)
    };
  });
  
  console.log('After scroll:', JSON.stringify(afterScroll, null, 2));
  
  await browser.close();
})();