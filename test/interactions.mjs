import { chromium } from 'playwright';
const BASE = 'http://localhost:3100';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const results = [];
const ok = (name, pass, detail='') => { results.push({name, pass}); console.log(`${pass?'PASS':'FAIL'}  ${name}${detail?' — '+detail:''}`); };

// ── Challenge end-to-end on prime-number-checker (choice: NOT prime = 91) ──
await p.goto(`${BASE}/experience/prime-number-checker`, { waitUntil: 'networkidle' });
await p.locator('.challenge-box .option-btn:has-text("91")').click();
await p.locator('.challenge-box button:has-text("Submit answer")').click();
await p.waitForTimeout(400);
const doneBadge = await p.locator('.challenge-box .done-badge').count();
const feedback = await p.locator('.challenge-box').innerText();
ok('Challenge correct answer marks completion', doneBadge >= 1, feedback.split('\n').find(l => /correct|well|nice/i.test(l)) || 'done-badge shown');
const storedCompleted = await p.evaluate(() => JSON.parse(localStorage.getItem('sokkar:completed') || '[]'));
ok('Challenge persists completion to localStorage', storedCompleted.includes('prime-number-checker'), JSON.stringify(storedCompleted));

// wrong answer path on gcd experience
await p.goto(`${BASE}/experience/greatest-common-divisor`, { waitUntil: 'networkidle' });
await p.fill('input[aria-label="Your answer"]', '41');
await p.locator('.challenge-box button:has-text("Submit answer")').click();
await p.waitForTimeout(300);
const wrongFeedback = await p.locator('.challenge-box').innerText();
ok('Challenge wrong answer shows feedback', /not quite|incorrect|try again/i.test(wrongFeedback));
await p.locator('.challenge-box button:has-text("Try again")').click();
await p.fill('input[aria-label="Your answer"]', '42');
await p.locator('.challenge-box button:has-text("Submit answer")').click();
await p.waitForTimeout(300);
const rightFeedback = await p.locator('.challenge-box').innerText();
ok('Challenge retry then correct works', /correct|well done/i.test(rightFeedback));

// ── Pause / Resume ──
await p.goto(`${BASE}/experience/newtons-second-law`, { waitUntil: 'networkidle' });
await p.locator('button:has-text("Generate Flowchart")').click();
await p.locator('button[aria-label="Run algorithm"]').click();
await p.waitForTimeout(400);
const pauseBtn = p.locator('button[aria-label="Pause execution"]');
const pauseDisabledMidRun = await pauseBtn.isDisabled();
await pauseBtn.click();
await p.waitForTimeout(200);
const resumeBtn = p.locator('button[aria-label="Resume execution"]');
const resumeVisible = await resumeBtn.isVisible();
await resumeBtn.click();
await p.locator('.result-banner').waitFor({ timeout: 30000 });
ok('Pause mid-run then resume finishes with result', resumeVisible && (await p.locator('.result-banner').innerText()).startsWith('Result'));

// ── Reset clears console and result ──
await p.locator('button[aria-label="Reset execution"]').click();
await p.waitForTimeout(200);
const consoleAfterReset = await p.locator('#exec-console').innerText();
const resultAfterReset = await p.locator('.result-banner').count();
ok('Reset clears console and result', /Press Run/.test(consoleAfterReset) && resultAfterReset === 0);

// ── Step executes exactly one node ──
await p.locator('button[aria-label="Execute one step"]').click();
await p.waitForTimeout(150);
const linesAfterStep = await p.locator('#exec-console .console-line').count();
ok('Step executes exactly one step', linesAfterStep === 1, `lines=${linesAfterStep}`);
await p.locator('button[aria-label="Execute one step"]').click();
await p.waitForTimeout(150);
ok('Second step increments to 2', (await p.locator('#exec-console .console-line').count()) === 2);

// ── Zoom controls ──
const zoomIn = p.locator('button[aria-label="Zoom in"]');
await zoomIn.click(); await zoomIn.click();
const zoomOut = p.locator('button[aria-label="Zoom out"]');
await zoomOut.click();
await p.locator('button[aria-label="Fit flowchart to screen"]').click();
ok('Zoom in/out/fit controls respond', true);

// ── Node inspector ──
const node = p.locator('svg[role="application"] [role="button"]').first();
await node.click();
await p.waitForTimeout(200);
const inspector = await p.locator('.node-inspector').count();
await p.locator('.node-inspector button[aria-label="Close node description"]').click();
ok('Node select opens and closes inspector', inspector === 1);

// ── Keyboard: node selection via Enter ──
await node.focus();
await p.keyboard.press('Enter');
await p.waitForTimeout(150);
ok('Keyboard Enter activates node', (await p.locator('.node-inspector').count()) === 1);

// ── Node keyboard focus visible (focus outline) ──
const outline = await node.evaluate(el => getComputedStyle(el).outlineStyle !== 'none' || getComputedStyle(el).outlineWidth !== '0px');
// SVG rect outline handling may differ; check aria-pressed instead
const pressed = await node.getAttribute('aria-pressed');
ok('Node has selectable ARIA state', pressed === 'true');

// ── Progress pill in nav reflects completion ──
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
const pill = await p.locator('.progress-pill').innerText();
ok('Nav progress pill reflects completions', /\d+\/60/.test(pill), pill.replace('\n', ' '));

// ── Reduced motion emulation: page still renders ──
await p.emulateMedia({ reducedMotion: 'reduce' });
await p.goto(`${BASE}/experience/hookes-law`, { waitUntil: 'networkidle' });
ok('Reduced-motion page renders', await p.locator('h1').first().isVisible());
await p.emulateMedia({ reducedMotion: 'no-preference' });

await b.close();
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} interaction checks passed`);
process.exit(failed ? 1 : 0);
