/// <reference lib="dom" />
// The blind player's kit (BRIEF §2's rung 4, §11.7; OR-145's http measure): the current page built and served over http
// as Pages serves it, opened in one headless Chromium, and played for an agent through only what a player perceives.
// What it gives back is the page's own words (its heading, the scene's prose, each control a player can press by its
// visible words, with the colour of its mark named as a player sees it, and the drawers as they are drawn), and a
// screenshot when asked; never an id, a selector, the engine's state or the source. An agent works only in the session
// folder this makes, by its play.sh:
//   play.sh look            the page as it stands
//   play.sh press <words>   press the control whose visible words these are (or begin, or contain, if only one does);
//                           or #n, its mark in the last look (a plain digit is the page's own key: use key)
//   play.sh key <key>       press a key (Enter, Escape, m, 1…)
//   play.sh shot            a screenshot; its path is said
// Started by the lead, not the agent:
//   bun scripts/cold-play/blind-page.ts <session folder> [--world iscoed] [--size 1280x800|390x844] [--brief <file>]
// The folder gets about.txt (revision, world, viewport, when), the brief (as brief.md, with common.md beside it),
// play.sh, and the turns the
// session made (turns.txt). The runner waits for commands appended to in.txt and answers each in out.txt.
import { chromium, type Page } from 'playwright-core';
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { SiteBuild } from '../../src/cli/site-build';

interface Control { n: number; words: string; mark?: string; shut?: boolean }
// Read in the page (installed there before it loads): what is drawn and visible, by its words; the colour of a
// control's mark by its name; the controls a player could press, outermost, in the order drawn.
const inPage = `
  const pressable = 'button, a[href], [role="button"], [data-act], [data-action]';
  const shown = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0; };
  const words = e => (e.innerText || e.getAttribute('aria-label') || '').split('\\n').map(l => l.trim())
    .filter(Boolean).join(' — ');
  const controls = () => [...document.querySelectorAll(pressable)]
    .filter(e => shown(e) && !e.parentElement?.closest('button, [data-act], [data-action]'));
  const tone = e => { const style = [e, ...e.querySelectorAll('*')].map(x => x.getAttribute('style') || '').join(' ');
    const named = /--tone-(\\w+)/.exec(style); return named ? named[1] + ' mark' : undefined; };
  window.blindControl = n => controls()[n - 1];
  // In reading order: each block of words where it is drawn, and each control where it stands among them (a heading
  // over the rows it heads, a told line under its label), so that nothing is moved away from what it belongs to.
  window.blindRead = () => {
    const list = controls(), at = new Map(list.map((e, i) => [e, i + 1])), order = [];
    const blocky = /^(H1|H2|H3|P|LI|BLOCKQUOTE|DT|DD|FIGCAPTION|SUMMARY)$/;
    const walk = e => {
      if (!shown(e)) { return; }
      if (at.has(e)) { order.push({ control: at.get(e) }); return; }
      if (blocky.test(e.tagName) && !e.querySelector(pressable) && !e.querySelector('p, li, h1, h2, h3')) {
        const text = words(e);
        if (text) { order.push({ text, heading: /^H[123]$/.test(e.tagName) }); }
        return;
      }
      for (const c of e.children) { walk(c); }
    };
    walk(document.body);
    const listed = list.map((e, i) => ({ n: i + 1, words: words(e) || '(a control with no words)', mark: tone(e),
      shut: e.disabled || e.getAttribute('aria-disabled') === 'true' }));
    return { order, controls: listed };
  };`;
interface Seen { order: { text?: string; heading?: boolean; control?: number }[]; controls: Control[] }
export class BlindPage {
  private controls: Control[] = [];
  private shots = 0;
  constructor(readonly page: Page, readonly dir: string) {}
  // What a player sees now: the page's words, and every control they could press, numbered as listed.
  async look(): Promise<string> {
    await this.settle();
    const seen = await this.page.evaluate('window.blindRead()') as Seen;
    this.controls = seen.controls;
    return BlindPage.said(seen);
  }
  // The page as it reads: its words, and each control where it stands, as [#n] with its words, the colour of its mark
  // named and (not now) where it cannot be pressed yet. The #n is this listing's, not a key of the page's: a digit
  // drawn on a row is the page's own (press it with key).
  private static said(s: Seen): string {
    const byN = new Map(s.controls.map(c => [c.n, c]));
    return s.order.map(o => {
      if (o.text) { return o.heading ? `== ${o.text}` : o.text; }
      const c = byN.get(o.control!)!;
      return `  [#${c.n}] ${c.words}${c.mark ? `  (${c.mark})` : ''}${c.shut ? '  (not now)' : ''}`;
    }).filter((l, i, all) => l !== all[i - 1]).join('\n');
  }
  // A control pressed by its visible words (exactly, else the one they begin, else the one they are in), or its number.
  async press(what: string): Promise<string> {
    // Matched against what is pressable now, not what the last look saw.
    await this.settle(); await this.look();
    const want = what.trim().toLowerCase(), byNumber = /^#\d+$/.test(want) ? Number(want.slice(1)) : undefined;
    const exact = this.controls.filter(c => c.words.toLowerCase() === want);
    const begun = this.controls.filter(c => c.words.toLowerCase().startsWith(want));
    const within = this.controls.filter(c => c.words.toLowerCase().includes(want));
    const found = byNumber ? this.controls.filter(c => c.n === byNumber)
      : exact.length ? exact : begun.length === 1 ? begun : within.length === 1 ? within : [];
    if (found.length !== 1) {
      const some = (begun.length ? begun : within).map(c => `[#${c.n}] ${c.words}`).slice(0, 8);
      return some.length ? `More than one control fits "${what}":\n${some.join('\n')}`
        : `Nothing to press says "${what}". As the page stands:\n${await this.look()}`;
    }
    const n = found[0]!.n;
    await this.page.evaluate(`window.blindControl(${n})?.scrollIntoView({ block: 'center' })`);
    const box = await this.box(n);
    if (!box) { return 'That control is no longer there.'; }
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await this.settle();
    return this.look();
  }
  private async box(n: number) {
    return this.page.evaluate(`(() => { const r = window.blindControl(${n})?.getBoundingClientRect();
      return r && { x: r.x, y: r.y, width: r.width, height: r.height }; })()`) as
      Promise<{ x: number; y: number; width: number; height: number } | undefined>;
  }
  async key(key: string): Promise<string> {
    await this.page.keyboard.press(key.trim());
    await this.settle();
    return this.look();
  }
  async shot(): Promise<string> {
    const path = join(this.dir, 'shots', `${String(++this.shots).padStart(3, '0')}.png`);
    await this.page.screenshot({ path });
    return `Saved ${path}`;
  }
  // As long as the game is still answering, and a moment for the page to draw what it answered.
  private async settle() {
    await this.page.waitForFunction(() => !(window as unknown as { kyrieMono?: { inspect(): { pending: boolean } } })
      .kyrieMono?.inspect().pending, null, { timeout: 60000 }).catch(() => undefined);
    // A page still being made (a world drawn, a life set out on) has nothing to press yet: waited for, a while.
    await this.page.waitForFunction('window.blindRead().controls.length > 0', null, { timeout: 180000 })
      .catch(() => undefined);
    await this.page.waitForTimeout(400);
  }
  async answer(line: string): Promise<string> {
    const [verb, ...rest] = line.trim().split(/\s+/), arg = rest.join(' ');
    if (verb === 'look') { return this.look(); }
    if (verb === 'press') { return this.press(arg); }
    if (verb === 'key') { return this.key(arg); }
    if (verb === 'shot') { return this.shot(); }
    return 'Say look, press <words>, key <key> or shot.';
  }
  static script(dir: string): string {
    return `#!/usr/bin/env bash
# One command to the game; prints what the page shows after it. Commands: look | press <words> | key <key> | shot
dir="${dir}"
count() { local c; c=$(grep -c '^@@ end' "$dir/out.txt" 2>/dev/null); echo "\${c:-0}"; }
n=$(count)
echo "$*" >> "$dir/in.txt"
for _ in $(seq 1 600); do
  m=$(count)
  if [ "$m" -gt "$n" ]; then awk -v k="$n" '/^@@ end/{c++; next} c==k' "$dir/out.txt"; exit 0; fi
  sleep 0.3
done
echo "The game did not answer in three minutes."
`;
  }
  private static option(args: string[], k: string, d: string): string {
    const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1]! : d;
  }
  static async main(args: string[]): Promise<void> {
    const dir = resolve(args[0] ?? '/var/tmp/kyrie-cold/session'), opt = BlindPage.option.bind(null, args);
    const world = opt('world', 'iscoed'), [width, height] = opt('size', '1280x800').split('x').map(Number);
    mkdirSync(join(dir, 'shots'), { recursive: true });
    const site = join(dir, '.site');
    await SiteBuild.site(site, {});
    const server = Bun.serve({ port: 0, fetch: SiteBuild.serve.bind(SiteBuild, site) });
    const brief = opt('brief', '');
    if (brief && existsSync(brief)) {
      copyFileSync(brief, join(dir, 'brief.md'));
      const common = join(dirname(brief), 'common.md');
      if (existsSync(common)) { copyFileSync(common, join(dir, 'common.md')); }
    }
    writeFileSync(join(dir, 'about.txt'), [`revision: ${SiteBuild.commit()}`, `world: ${world}`,
      `viewport: ${width}x${height}${width! < 600 ? ' (touch)' : ''}`, `begun: ${new Date().toISOString()}`].join('\n') + '\n');
    writeFileSync(join(dir, 'play.sh'), BlindPage.script(dir)); chmodSync(join(dir, 'play.sh'), 0o755);
    writeFileSync(join(dir, 'in.txt'), ''); writeFileSync(join(dir, 'out.txt'), '');
    const path = process.env.KYRIE_CHROMIUM;
    const browser = await chromium.launch(path ? { executablePath: path } : {});
    const page = await browser.newPage({ viewport: { width: width!, height: height! },
      ...width! < 600 ? { hasTouch: true } : {} });
    await page.addInitScript(inPage);
    await page.goto(`${server.url}mono.html?world=${world}`);
    const blind = new BlindPage(page, dir);
    let done = 0;
    console.log(`Ready: ${dir}/play.sh look`);
    for (;;) {
      const lines = readFileSync(join(dir, 'in.txt'), 'utf8').split('\n').filter(l => l.trim());
      for (const line of lines.slice(done)) {
        if (line.trim() === 'quit') { await browser.close(); await server.stop(true); return; }
        let said: string;
        try { said = await blind.answer(line); } catch (e) { said = `That did not work: ${String(e).split('\n')[0]}`; }
        appendFileSync(join(dir, 'turns.txt'), `> ${line}\n`);
        appendFileSync(join(dir, 'out.txt'), `${said}\n@@ end\n`);
        done++;
      }
      await Bun.sleep(200);
    }
  }
}
if (import.meta.main) { await BlindPage.main(process.argv.slice(2)); }
