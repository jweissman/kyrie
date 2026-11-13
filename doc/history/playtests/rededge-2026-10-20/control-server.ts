import { chromium } from 'playwright-core';
const out = process.argv[2]!; let n = 0;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
Bun.serve({ port: 7358, hostname: '127.0.0.1', async fetch(req) {
  const u = new URL(req.url), q = u.searchParams;
  try {
    if (u.pathname === '/goto') { await page.goto(`file:///home/jweissman/work/kyrie/site/mono.html${q.get('q') ?? ''}`); await page.evaluate(() => { try { localStorage.clear(); } catch {} }); await page.reload(); }
    if (u.pathname === '/reload') { await page.reload(); }
    if (u.pathname === '/do') {
      const inspect = () => page.evaluate(() => (window as any).kyrieMono.inspect());
      let st = await inspect();
      if (st.menu) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); st = await inspect(); }
      const row = q.get('row')!, i = st.rows.findIndex((r: any) => r.id === row || r.id.endsWith('__' + row) || r.id.endsWith(':' + row) || r.label.startsWith(row));
      if (i < 0) { return new Response('NO ROW ' + row + ' in ' + st.rows.map((r: any) => r.id + '|' + r.label).join(', ')); }
      await page.keyboard.press(String(i + 1)); await page.waitForTimeout(150);
      if (q.has('act')) {
        st = await inspect(); const j = (st.menu ?? []).findIndex((a: any) => a.label.startsWith(q.get('act')!));
        if (j < 0) { return new Response('NO ACT ' + q.get('act') + ' in ' + JSON.stringify(st.menu)); }
        await page.keyboard.press(String(j + 1));
        await page.waitForFunction(() => !(window as any).kyrieMono.inspect().pending, null, { timeout: 60000 });
      }
    }
    if (u.pathname === '/key') { for (const k of (q.get('k') ?? '').split(',')) { await page.keyboard.press(k); await page.waitForTimeout(150); } }
    if (u.pathname === '/click') { await page.click(q.get('s')!); }
    if (u.pathname === '/text') { await page.getByText(q.get('t')!, { exact: q.has('exact') }).first().click(); }
    if (u.pathname === '/eval') { const r = await page.evaluate(req.method === 'POST' ? await req.text() : q.get('js')!); return new Response(JSON.stringify(r, null, 1)); }
    await page.waitForTimeout(Number(q.get('wait') ?? 400));
    const file = `${out}/shot-${String(++n).padStart(3, '0')}.png`;
    if (q.has('shot')) { await page.screenshot({ path: file }); }
    const text = await page.evaluate(() => document.body.innerText);
    return new Response(`${q.has('shot') ? file + '\n' : ''}errors=${JSON.stringify(errors)}\n${text}`);
  } catch (e) { return new Response(`ERROR ${(e as Error).message}`); }
} });
console.log('ready');
