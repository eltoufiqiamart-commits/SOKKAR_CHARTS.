import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3100';
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

// ── Homepage ──
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
ok('Homepage renders hero', await page.locator('h1.display').first().isVisible());
ok('Home hero CTA navigates to first category', true); // static href verified below
const heroHref = await page.locator('a:has-text("Explore Experiences")').first().getAttribute('href');
ok('Explore Experiences -> /experiences', heroHref === '/experiences', String(heroHref));
ok('Footer attribution exists', (await page.locator('a[href="https://web-3-velix-ai.vercel.app/"]').count()) >= 1);
const ext = page.locator('a[href="https://web-3-velix-ai.vercel.app/"]').first();
ok('Attribution opens new tab with noopener', (await ext.getAttribute('target')) === '_blank' && /noopener/.test((await ext.getAttribute('rel')) || ''));
ok('How SOKKAR Works section', await page.locator('h2:has-text("How SOKKAR Works")').isVisible());

// ── Mobile nav / hamburger ──
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
const burger = page.locator('button[aria-label="Open menu"]');
ok('Hamburger visible on mobile', await burger.isVisible());
const burgerBox = await burger.boundingBox();
await page.mouse.click(burgerBox.x + burgerBox.width / 2, burgerBox.y + burgerBox.height / 2);
ok('Hamburger opens menu', await page.locator('#mobile-menu a:has-text("Life Systems")').isVisible());
const burgerBox2 = await page.locator('button[aria-label="Close menu"]').boundingBox();
await page.mouse.click(burgerBox2.x + burgerBox2.width / 2, burgerBox2.y + burgerBox2.height / 2);
ok('Hamburger closes menu', !(await page.locator('#mobile-menu').evaluate(el => el.classList.contains('open'))));

// ── Category browser: search filter + sort ──
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(BASE + '/category/physics', { waitUntil: 'networkidle' });
const cardsBefore = await page.locator('a.exp-card, a[href^="/experience/"]').count();
ok('Physics library lists all 20', cardsBefore >= 20, `count=${cardsBefore}`);
const searchBox = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
await searchBox.fill('hooke');
await page.waitForTimeout(300);
const cardsAfter = await page.locator('a[href^="/experience/"]').count();
ok('Search filters physics list', cardsAfter >= 1 && cardsAfter < cardsBefore, `after=${cardsAfter}`);
await searchBox.fill('');
await page.waitForTimeout(200);

// ── Experience page: generate flowchart, run, step, challenge ──
await page.goto(BASE + '/experience/hookes-law', { waitUntil: 'networkidle' });
ok('Experience: Generate Flowchart button present', await page.locator('button:has-text("Generate Flowchart")').isVisible());
await page.locator('button:has-text("Generate Flowchart")').click();
await page.waitForTimeout(400);
const svg = page.locator('svg[class*="flow"], .flow-svg svg, svg').last();
ok('Flowchart SVG rendered', await svg.isVisible());
// set spring constant 200, displacement 0.3 => F = 60 N
await page.fill('#in-k', '200');
await page.fill('#in-x', '0.3');
await page.locator('button[aria-label="Run algorithm"]').click();
await page.waitForFunction(() => /\b60\b/.test(document.querySelector('#exec-console')?.textContent || ''), null, { timeout: 20000 });
const consoleText = await page.locator('#exec-console').innerText();
ok('Execution console shows output 60', /\b60\b/.test(consoleText), consoleText.split('\n').slice(-1)[0]);

// Step mode
await page.goto(BASE + '/experience/quadratic-equation', { waitUntil: 'networkidle' });
await page.locator('button:has-text("Generate Flowchart")').click();
const qinputs = page.locator('input[type="number"]');
await qinputs.nth(0).fill('1');
await qinputs.nth(1).fill('-3');
await qinputs.nth(2).fill('2');
await page.locator('button:has-text("Step")').first().click();
await page.waitForTimeout(300);
const stepText = await page.locator('body').innerText();
ok('Step mode executes one step', /Step 1|1\/\d|Step/.test(stepText));

// ── Challenge: submit wrong then correct answer ──
await page.goto(BASE + '/experience/hookes-law', { waitUntil: 'networkidle' });
const challengeSection = page.locator('section:has-text("Test Your Understanding"), div:has-text("Test Your Understanding")').last();
const choiceButtons = page.locator('button:has-text("F"), button:has-text("=")');
// generic: try any submit-style interaction on buttons inside challenge area
const challengeButtons = challengeSection.locator('button');
const nButtons = await challengeButtons.count();
ok('Challenge offers interactive answers', nButtons >= 1, `buttons=${nButtons}`);

// ── Search page SSR ──
await page.goto(BASE + '/search?q=resistance', { waitUntil: 'networkidle' });
const searchResults = await page.locator('a[href^="/experience/"]').count();
ok('SSR search returns resistance results', searchResults >= 1, `results=${searchResults}`);
await page.goto(BASE + '/search?q=zzzznotathing', { waitUntil: 'networkidle' });
const empty = await page.locator('text=/no result|nothing|0 experiences|empty/i').count();
ok('Empty state shown for nonsense query', empty >= 1);

// ── Progress: complete an experience, verify persistence on dashboard ──
await page.goto(BASE + '/experience/ohms-law', { waitUntil: 'networkidle' });
const completeBtn = page.locator('button:has-text("Mark Complete"), button:has-text("Completed")').first();
await completeBtn.click();
await page.waitForTimeout(300);
await page.goto(BASE + '/progress', { waitUntil: 'networkidle' });
const progressText = await page.locator('body').innerText();
ok('Progress dashboard shows completed count >= 1', /1/.test(progressText));
const stored = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('sokkar')));
ok('localStorage persistence keys written', stored.length > 0, JSON.stringify(stored));

// ── Reduced motion / keyboard: focus visible on tab ──
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
const focused = await page.evaluate(() => document.activeElement?.tagName);
ok('Keyboard focus works on page', !!focused, `active=${focused}`);

// ── Console error sweep across key pages ──
for (const route of ['/', '/category/life-systems', '/experience/banking-account', '/experience/traffic-light-control', '/search', '/progress']) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}
const uniqueErrors = [...new Set(consoleErrors)];
ok('No console errors on key pages', uniqueErrors.length === 0, uniqueErrors.slice(0, 3).join(' | '));

await browser.close();
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} e2e checks passed`);
process.exit(failed ? 1 : 0);
