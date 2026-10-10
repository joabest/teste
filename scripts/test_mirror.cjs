/* Run with Playwright available in NODE_PATH and Chromium on the machine. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.MIRROR_BASE_URL || 'http://127.0.0.1:8080';
const output = process.env.MIRROR_TEST_OUTPUT || '/tmp/mirror-browser-tests';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const results = [];
  try {
    for (const [width, height] of [[360, 800], [390, 844], [412, 915], [1366, 768], [1920, 1080]]) {
      const mobile = width < 768;
      const page = await browser.newPage({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
      const errors = [], failedLocal = [], originalAssets = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failedLocal.push(response.url()); });
      page.on('request', request => { if (new URL(request.url()).hostname === 'weevolveit.com') originalAssets.push(request.url()); });
      await page.goto(base + '/', { waitUntil: 'networkidle' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'horizontal overflow');
      assert.equal(await page.locator('[data-method-name]').allTextContents().then(names => names.map(name => name.trim()).join(',')), 'Discover,Diagnose,Design,Deliver,Evolve');
      assert.equal(await page.locator('[data-method-name]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1')), true, 'Method text hidden');
      assert.equal(await page.locator('[data-complete], a[href*="awwwards.com/sites/weevolveit"], #ink-edge, footer canvas').count(), 0);
      if (mobile) {
        assert.equal(await page.locator('canvas').count(), 0, 'mobile canvas must be absent');
        assert.equal(await page.locator('[data-method-rail]').evaluate(el => getComputedStyle(el).position), 'relative');
        const flow = await page.locator('[data-method-slide]').evaluateAll(slides => slides.every((slide, index) => index === 0 || slide.getBoundingClientRect().top >= slides[index - 1].getBoundingClientRect().bottom - 1));
        assert.equal(flow, true, 'Method slides overlap');
        const toggle = page.locator('[data-menu-toggle]');
        const panel = page.locator('[data-menu-panel]');
        await toggle.tap();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        assert.equal(await panel.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(11, 11, 13)');
        assert.equal(await panel.evaluate(el => getComputedStyle(el).touchAction), 'pan-y');
        await panel.locator('summary').click();
        assert.equal(await panel.evaluate(el => el.scrollHeight > el.clientHeight), true, 'expanded menu should have scrollable content');
        const cdp = await page.context().newCDPSession(page);
        const x = Math.floor(width / 2), y = height - 100;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let dy = 20; dy <= 260; dy += 20) {
          await page.waitForTimeout(20);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - dy }] });
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(150);
        assert.equal(await panel.evaluate(el => el.scrollTop > 0), true, 'menu does not scroll by touch');
        await page.screenshot({ path: `${output}/menu-${width}.png` });
        await toggle.tap();
        assert.equal(await panel.isVisible(), false);
        assert.equal(await page.evaluate(() => document.body.style.position !== 'fixed' && document.body.style.overflow !== 'hidden'), true, 'body remains locked');
        await toggle.tap();
        await page.touchscreen.tap(3, 120);
        assert.equal(await panel.isVisible(), false, 'outside tap does not close');
        await toggle.tap();
        await panel.locator('a[href="/method"]').tap();
        await page.waitForURL(base + '/method');
        assert.equal(await page.locator('[data-menu-panel]').isVisible(), false);
        assert.equal(await page.evaluate(() => document.body.style.position !== 'fixed'), true);
        await page.goto(base + '/', { waitUntil: 'networkidle' });
      } else {
        assert.equal(await page.locator('[data-globe-slot] canvas').count(), 1);
        const geometry = await page.locator('[data-method]').evaluate(method => {
          const intro = method.querySelector('[data-method-intro]');
          const rail = method.querySelector('[data-method-rail]');
          const track = method.querySelector('[data-method-track]');
          return { start: method.getBoundingClientRect().top + scrollY + intro.offsetHeight, distance: track.scrollWidth - rail.clientWidth };
        });
        for (let index = 0; index < 5; index++) {
          await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), geometry.start + geometry.distance * index / 4);
          await page.waitForTimeout(60);
          const x = await page.locator('[data-method-slide]').nth(index).evaluate(slide => slide.getBoundingClientRect().left);
          assert.ok(Math.abs(x) < 3, `Method slide ${index} is not on screen: ${x}`);
        }
        await page.goto(base + '/services', { waitUntil: 'networkidle' });
        const card = page.locator('.mirror-hover-card').first();
        assert.ok(await card.count(), 'no Services hover cards');
        await card.hover();
        await page.waitForTimeout(250);
        assert.equal(await card.evaluate(el => getComputedStyle(el).transform.includes('-4')), true, 'hover does not lift card');
        await page.locator('[data-service-filter="ai"]').click();
        assert.equal(await page.locator('[data-services-grid] > li:not([hidden])').count(), 3);
        await page.locator('[data-service-filter="all"]').click();
        assert.equal(await page.locator('[data-services-grid] > li:not([hidden])').count(), 16);
        await page.locator('[data-service-view="list"]').click();
        assert.equal(await page.locator('[data-services-grid]').evaluate(el => el.classList.contains('services-list-view')), true);
        const offscreen = await page.locator('video').last().evaluate(video => ({ preload: video.preload, paused: video.paused, poster: !!video.poster, hasSrc: !!video.getAttribute('src') }));
        assert.deepEqual(offscreen, { preload: 'none', paused: true, poster: true, hasSrc: false });
        await page.goto(base + '/', { waitUntil: 'networkidle' });
      }
      // Every input and textarea must own its hit-test point, rather than another section's text.
      for (const field of await page.locator('[data-lead-form] input:not([type=checkbox]), [data-lead-form] textarea, [data-lead-form] button').all()) {
        await field.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const clear = await field.evaluate(el => {
          const rect = el.getBoundingClientRect();
          const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          return top === el || el.contains(top);
        });
        assert.equal(clear, true, 'form field obstructed');
      }
      await page.locator('[data-lead-form] textarea').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.screenshot({ path: `${output}/form-${width}.png` });
      await page.goto(base + '/blog', { waitUntil: 'networkidle' });
      const button = page.locator('[data-blog-more]');
      assert.equal(await page.locator('[data-blog-grid] > li:not([hidden])').count(), 20);
      for (const count of [40, 60, 80, 100, 103]) {
        await button.click();
        assert.equal(await page.locator('[data-blog-grid] > li:not([hidden])').count(), count);
        if (count === 100) assert.equal(await button.textContent(), 'Show 3 more articles');
      }
      assert.equal(await button.isVisible(), false);
      assert.deepEqual(errors, [], 'browser JS error');
      assert.deepEqual(failedLocal, [], 'failed local asset');
      assert.deepEqual(originalAssets, [], 'runtime depends on original host');
      results.push({ width, height, status: 'passed' });
      console.log(`PASS ${width}x${height}: layout, Method, form stacking, ${mobile ? 'touch menu' : 'globe and hover'}, blog 20→103`);
      await page.close();
    }
    const page = await browser.newPage();
    for (const [alias, canonical] of [['business-diagnosis', 'ai-business-check'], ['ai-visibility-check', 'ai-check'], ['free-seo-check', 'seo-check']]) {
      await page.goto(`${base}/${alias}`);
      assert.equal(page.url(), `${base}/${canonical}`);
    }
    await page.goto(base + '/es/blog', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-blog-grid] > li:not([hidden])').count(), 20);
    assert.equal(await page.locator('[data-blog-more]').textContent(), 'Mostrar 20 artículos más');
    await page.goto(base + '/contact', { waitUntil: 'networkidle' });
    await page.locator('[name=name]').fill('Local validation');
    await page.locator('[name=email]').fill('validation@example.invalid');
    await page.locator('[name=message]').fill('Local-only test; no backend is available.');
    await page.locator('[name=consent]').check();
    await page.locator('[data-lead-form] button').click();
    await page.waitForFunction(() => document.querySelector('[data-lead-form] [role=status]').textContent.includes('Could not send'));
    assert.equal(await page.locator('[data-lead-form] [type=submit]').isEnabled(), true);
    console.log('PASS aliases, Spanish pagination and honest unavailable-backend handling');
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
