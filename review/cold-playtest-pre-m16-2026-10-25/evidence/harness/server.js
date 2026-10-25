const { chromium } = require('playwright');
const http = require('http');
let page, n = 0;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  page = await ctx.newPage();
  page.on('console', m => { if (m.type()==='error') require('fs').appendFileSync('/tmp/claude-0/drv/console.log', m.text()+'\n'); });
  page.on('pageerror', e => require('fs').appendFileSync('/tmp/claude-0/drv/console.log', 'PAGEERROR '+e.message+'\n'));
  http.createServer(async (req, res) => {
    let body = ''; req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const out = await new Function('page', 'return (async()=>{' + body + '})()')(page);
        res.end(typeof out === 'string' ? out : JSON.stringify(out, null, 1));
      } catch (e) { res.end('ERR ' + e.message); }
    });
  }).listen(9333);
})();
