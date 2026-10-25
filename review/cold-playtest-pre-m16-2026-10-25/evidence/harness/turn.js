const t0 = await page.innerText("body");
if (!t0.includes("A FIGHT")) return "NOT IN FIGHT\n" + t0.slice(0,800);
let xs = await page.$$("button");
for (const b of xs) { if ((await b.innerText()).startsWith("Strike with")) { await b.click(); break; } }
await page.waitForTimeout(400);
xs = await page.$$("button"); let best=null, bp=-1;
for (const b of xs) { const t = await b.innerText(); const m = t.match(/(\d+) in (\d+)/); if (m && !t.startsWith("Strike") && !t.startsWith("Cleave") && !t.startsWith("Sweep")) { const p=m[1]/m[2]; if (p>bp){bp=p;best=b;} } }
if (best) await best.click();
await page.waitForTimeout(900);
await page.screenshot({path:"/tmp/claude-0/shots/fight-"+Date.now()+".png"});
const t = await page.innerText("body");
return t.split("THE FIGHT SO FAR")[0].replace(/\n\n+/g,"\n");
