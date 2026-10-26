import { readFileSync, writeFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';
import { FictionalTime } from '../../src/presentation/fictional-time';

// Plays a journey's steps (a fixture of phases of labels, as test/fixtures/wrayford keeps them) and writes what the
// page said under each label to Markdown, folding waits and quoting what happened during them, so that a playthrough
// can be read as a player reads it.
//   bun test/support/transcript.ts <campaign> <seed> <steps.json> <out.md> <title>
export class Transcript {
  static async write(campaign: string, seed: string, file: string, to: { out: string; title: string }) {
    const { out, title } = to;
    const phases = JSON.parse(readFileSync(file, 'utf8')) as Record<string, string[]>;
    const j = await Journey.start(campaign, seed);
    const lines = [`# ${title}`, '', `Campaign \`${campaign}\`, seed \`${seed}\`, steps \`${file}\`. Each step is the label the `
      + 'player chose; under it, what the page said. Waits are folded.', ''];
    for (const [phase, steps] of Object.entries(phases)) {
      lines.push(`## ${phase}`, '');
      if (await this.phase(j, steps, lines)) { break; }
    }
    const ended = j.campaign.world.related('reached').map(r => r.args[0]);
    lines.push('## Ending', '', `Reached: ${ended.join(', ') || 'none'}.`, '');
    writeFileSync(out, lines.join('\n'));
    return ended;
  }
  // Plays one phase; true when the story has ended or a step could not be taken.
  private static async phase(j: Journey, steps: string[], lines: string[]): Promise<boolean> {
    for (const step of steps) {
      const before = j.taken.length;
      let failed = false;
      try { await j.play(step); } catch (e) {
        failed = true;
        if (j.campaign.running) { lines.push(`*(${(e as Error).message.slice(0, 120)})*`, ''); return true; }
      }
      const taken = j.taken.slice(before), when = FictionalTime.at(j.watch(), j.campaign.state.minutes);
      if (step.startsWith('=')) {
        const events = taken.flatMap(t => (t.event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text));
        lines.push(`**… (waiting, to ${when})**`, '', ...events.map(e => `> ${e}`), ...events.length ? [''] : []);
      } else {
        lines.push(`**› ${taken.at(-1)?.label ?? step}** · *${when}*`, '', taken.map(t => t.page.trim()).filter(Boolean).join(' '), '');
      }
      if (!j.campaign.running || failed) { lines.push('*(the story ends)*', ''); return true; }
    }
    return false;
  }
}

if (import.meta.main) {
  const [campaign, seed, file, out, title] = process.argv.slice(2);
  console.log(await Transcript.write(campaign!, seed!, file!, { out: out!, title: title ?? file! }));
}
