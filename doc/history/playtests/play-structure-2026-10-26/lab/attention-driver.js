// Instrumented page driver for the attention budget (creative-direction.md §7.2). Serve site/ on :8123, then
// PORT=7779 SEED_BYTES='[10,200,33,77]' node attention-driver.js ; drive it over HTTP (/btn?t=label, /key?k=j, /state);
// every click and key is appended to $OPLOG with the scrolls it needed and the lines that appeared after it.
const { chromium } = require('playwright');
const http = require('http');
const W = +process.env.W || 1280, H = +process.env.H || 900;
(async () => {
  const ctx = await chromium.launchPersistentContext(process.env.PROFILE || require('path').join(require('os').tmpdir(), 'kyrie-attention-profile'), { viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  if (process.env.SEED_BYTES) await page.addInitScript(b => { const orig = crypto.getRandomValues.bind(crypto); crypto.getRandomValues = (a) => { if (a && a.length === 4 && a instanceof Uint8Array) { const v = JSON.parse(b); for (let i = 0; i < 4; i++) a[i] = v[i]; return a; } return orig(a); }; }, process.env.SEED_BYTES);
  const fs = require('fs'); const OPLOG = process.env.OPLOG || 'ops.jsonl';
  let lastText = '';
  async function record(op, label, scrolls) {
    await page.waitForTimeout(50);
    const text = await page.evaluate(() => document.body.innerText);
    const before = new Set(lastText.split('\n').map(x => x.trim()));
    const fresh = text.split('\n').map(x => x.trim()).filter(x => x && !before.has(x));
    lastText = text;
    fs.appendFileSync(OPLOG, JSON.stringify({ t: Date.now(), op, label, scrolls, fresh: fresh.slice(0, 60) }) + '\n');
  }
  const logs = [];
  page.on('console', m => { if (m.type()==='error'||m.type()==='warning') logs.push(m.type()+': '+m.text()); });
  page.on('pageerror', e => logs.push('pageerror: '+e.message));
  await page.goto(process.env.URL || 'http://localhost:8123/mono.html');
  let clicks = 0, keys = 0;
  async function state(full) {
    return await page.evaluate((full) => {
      const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none'; };
      const btns = [...document.querySelectorAll('button, [role=button], a[href], input, select, [tabindex]:not([tabindex="-1"])')].filter(vis);
      window.__btns = btns;
      const b = btns.map((e,i)=>`[${i}] <${e.tagName.toLowerCase()}${e.disabled?' disabled':''}${e===document.activeElement?' FOCUS':''}> ${(e.innerText||e.value||e.getAttribute('aria-label')||e.title||'').replace(/\s+/g,' ').trim().slice(0,140)}`);
      const t = document.body.innerText;
      return { text: full ? t : t.slice(0, 12000), len: t.length, buttons: b, scrollH: document.documentElement.scrollHeight };
    }, full);
  }
  http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x'); const q = u.searchParams; let out = {};
    try {
      if (u.pathname === '/click') { clicks++; await page.evaluate(i => window.__btns[i].click(), +q.get('i')); await page.waitForTimeout(+(q.get('w')||600)); out = await state(); }
      else if (u.pathname === '/btn') { clicks++; await state(); const info = await page.evaluate(([t,n]) => { const m = window.__btns.filter(e => (e.innerText||e.value||'').replace(/\s+/g,' ').includes(t)); if (!m[n]) return null; const r = m[n].getBoundingClientRect(); const H = innerHeight; const scrolls = r.bottom > H ? Math.ceil((r.bottom - H) / (H * 0.8)) : 0; const label = (m[n].innerText||'').replace(/\s+/g,' ').trim().slice(0,90); m[n].click(); window.scrollTo(0,0); return { scrolls, label }; }, [q.get('t'), +(q.get('n')||0)]); if (!info) { out = { error: 'no button: '+q.get('t') }; } else { await page.waitForTimeout(+(q.get('w')||900)); await record('click', info.label, info.scrolls); out = await state(); } }
      else if (u.pathname === '/select') { await page.locator('select').nth(+q.get('n')).selectOption({ label: q.get('v') }); await page.waitForTimeout(500); out = await state(); }
      else if (u.pathname === '/fill') { await page.locator('input').nth(+(q.get('n')||0)).fill(q.get('v')); await page.waitForTimeout(300); out = await state(); }
      else if (u.pathname === '/clicktext') { clicks++; await page.getByText(q.get('t'), { exact: q.get('exact')==='1' }).first().click(); await page.waitForTimeout(+(q.get('w')||600)); out = await state(); }
      else if (u.pathname === '/key') { keys++; await page.keyboard.press(q.get('k')); await page.waitForTimeout(+(q.get('w')||400)); await record('key', q.get('k'), 0); out = await state(); }
      else if (u.pathname === '/type') { await page.keyboard.type(q.get('t')); out = await state(); }
      else if (u.pathname === '/hover') { await page.evaluate(i => window.__btns[i].scrollIntoView(), +q.get('i')); const bb = await page.evaluate(i => { const r = window.__btns[i].getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }, +q.get('i')); await page.mouse.move(bb[0], bb[1]); await page.waitForTimeout(500); out = await state(); }
      else if (u.pathname === '/shot') { await page.screenshot({ path: q.get('p'), fullPage: q.get('full')==='1' }); out = { ok: 1 }; }
      else if (u.pathname === '/eval') { out = { r: await page.evaluate(q.get('js')) }; }
      else if (u.pathname === '/reload') { await page.reload(); await page.waitForTimeout(1500); out = await state(); }
      else if (u.pathname === '/logs') { out = { logs: logs.splice(0), clicks, keys }; }
      else out = await state(q.get('full')==='1');
    } catch (e) { out = { error: String(e) }; }
    res.end(JSON.stringify(out));
  }).listen(+process.env.PORT || 7777);
  console.log('ready');
})();
