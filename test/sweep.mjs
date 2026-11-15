import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:3100';

const home = await fetch(BASE + '/experiences').then(r => r.text());
const slugs = [...new Set([...home.matchAll(/\/experience\/([a-z0-9-]+)/g)].map(m => m[1]))];
console.log('Discovered', slugs.length, 'experiences\n');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = [];
for (const slug of slugs) {
  const errors = [];
  const onConsole = m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); };
  const onPageError = e => errors.push('pageerror: ' + String(e.message).slice(0, 200));
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  let outcome = 'unknown', banner = '', secs = 0, genOk = false, challenge = false;
  const t0 = Date.now();
  try {
    await page.goto(`${BASE}/experience/${slug}`, { waitUntil: 'networkidle', timeout: 30000 });
    challenge = await page.locator('text=Test Your Understanding').count() > 0;
    const genBtn = page.locator('button:has-text("Generate Flowchart")').first();
    await genBtn.waitFor({ state: 'visible', timeout: 10000 });
    await genBtn.click();
    await page.locator('svg[role="application"]').first().waitFor({ state: 'visible', timeout: 8000 });
    genOk = true;
    // max speed
    await page.locator('#speed').evaluate(el => {
      el.value = el.max;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.locator('button[aria-label="Run algorithm"]').click();
    await page.locator('.result-banner').waitFor({ state: 'visible', timeout: 60000 });
    banner = (await page.locator('.result-banner').innerText()).trim();
    outcome = banner.startsWith('Result') ? 'ok' : 'err-default-input';
    secs = Math.round((Date.now() - t0) / 1000);
  } catch (e) {
    outcome = 'FAIL: ' + String(e.message).split('\n')[0].slice(0, 120);
    secs = Math.round((Date.now() - t0) / 1000);
  }
  page.off('console', onConsole);
  page.off('pageerror', onPageError);
  results.push({ slug, outcome, genOk, challenge, secs, errors });
  const flag = outcome === 'ok' && errors.length === 0 ? 'PASS' : (outcome.startsWith('err') ? 'WARN' : 'FAIL');
  console.log(`${flag}  ${slug.padEnd(34)} ${outcome === 'ok' ? 'Result: ' + banner.replace(/\n/g, ' ').slice(0, 70) : outcome}  [${secs}s${errors.length ? ', ' + errors.length + ' console errors' : ''}]`);
}
await browser.close();
const pass = results.filter(r => r.outcome === 'ok').length;
const errs = results.filter(r => r.outcome !== 'ok');
const consoleErrs = results.filter(r => r.errors.length > 0);
console.log(`\n=== ${pass}/${results.length} produce a Result banner; ${errs.length} without; console errors on ${consoleErrs.length} page(s) ===`);
if (consoleErrs.length) for (const r of consoleErrs) console.log('  ', r.slug, '→', r.errors.join(' | '));
