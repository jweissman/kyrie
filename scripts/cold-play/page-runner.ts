/// <reference lib="dom" />
// A cold play on the deployed page (OB-05, S3-1): the game at a URL (GitHub Pages) played in one headless Chromium as
// a player plays it, by the page's own controls (MonoDriver: what a click or a key does there), and each turn written
// as one JSON line in the shape the blind player's helpers read (scripts/cold-play/show.py): what the page shows,
// word for word, the rows it leads with and the rest, by their ids. Moves come one per line on stdin, as
// scripts/cold-play.sh feeds `bin/kyrie run`: {"act":"<id>"} (in a fight, "fight:auto" lets the company fight its
// turn), {"follow":"<aim>"}, {"look":true}.
//   bun scripts/cold-play/page-runner.ts <url> [query]   e.g. https://jweissman.github.io/kyrie/mono.html ?world=iscoed
import { chromium, type Page } from 'playwright-core';
import { createInterface } from 'node:readline';
import { MonoDriver, type ChoiceShape } from '../../test/support/mono-driver';

interface Row { id: string; label: string; aspects?: string[] }
export class PageRunner {
  turn = 0;
  constructor(readonly page: Page, readonly d: MonoDriver) {}
  // What the page shows now: its words as drawn, the four it leads with and the rest.
  async said(): Promise<Record<string, unknown>> {
    await this.d.settle().catch(PageRunner.none);
    const s = await this.d.inspect();
    const text: string = await this.page.evaluate(() =>
      (document.querySelector<HTMLElement>('.stage') ?? document.body).innerText);
    const lines = [...new Set(text.split('\n').map(l => l.trim()).filter(Boolean))].slice(0, 80);
    const choices: ChoiceShape[] = s.choices, led = new Set((s.glance?.acts ?? []).map(a => a.choice));
    const primary = led.size ? choices.filter(c => led.has(c.id)) : choices.slice(0, 4);
    const rest = choices.filter(c => !primary.includes(c));
    return { turn: this.turn, moment: s.mode, at: s.place?.name ?? s.place?.id, scene: { lines },
      offer: { primary: primary.map(PageRunner.row), rest: rest.map(PageRunner.row) },
      ...s.combat ? { fight: { yours: s.combat.ours, foes: s.combat.foes, outcome: s.combat.outcome } } : {},
      ...s.party ? { you: s.party.map(m => `${m.name} ${m.hp} HP`).join(', ') } : {},
      ...s.error ? { error: s.error } : {} };
  }
  private static row(c: ChoiceShape): Row {
    return { id: c.id, label: c.label, ...c.disabled ? { aspects: [`shut: ${c.disabled}`] } : {} };
  }
  private static none(): void { /* the page still busy: what it shows is said as it stands */ }
  async move(line: string): Promise<Record<string, unknown>> {
    const m = JSON.parse(line) as { act?: string; look?: boolean; follow?: string };
    // An aim followed is its row on the page (follow:<aim>), taken as any row is.
    const act = m.follow ? `follow:${m.follow}` : m.act;
    try {
      if (act === 'fight:auto') { await this.d.key('t'); } else if (act) {
        await this.d.pick(c => c.id === act, act);
      }
    } catch (e) { return { turn: this.turn, error: String(e).split('\n')[0]!.slice(0, 600) }; }
    this.turn++;
    return this.said();
  }
  // One turn written, with what the page threw since the last.
  private static out(o: Record<string, unknown>, errors: string[]): void {
    process.stdout.write(`${JSON.stringify({ ...o, ...errors.length ? { pageErrors: errors.splice(0) } : {} })}\n`);
  }
  static async main(url: string, query: string): Promise<void> {
    const path = process.env.KYRIE_CHROMIUM;
    const browser = await chromium.launch(path ? { executablePath: path } : {});
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${url}${query}`);
    await page.waitForSelector('[data-mode="create"]', { timeout: 180000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"], [data-mode="prologue"]', { timeout: 180000 });
    const r = new PageRunner(page, new MonoDriver(page));
    PageRunner.out(await r.said(), errors);
    for await (const line of createInterface({ input: process.stdin })) {
      if (line.trim()) { PageRunner.out(await r.move(line), errors); }
    }
    await browser.close();
  }
}
if (import.meta.main) { await PageRunner.main(process.argv[2]!, process.argv[3] ?? ''); }
