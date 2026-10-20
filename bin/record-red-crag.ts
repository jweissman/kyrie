#!/usr/bin/env bun
import { mkdir, writeFile } from 'node:fs/promises';
import { RedCragHistories, type RedCragHistory } from '../test/red-crag-histories';
import type { CampaignEvent } from '../src/campaign/campaign';
import type { CombatEvent } from '../src/model';

// Developer evidence: plays the three Red Crag histories through PlaySession and writes their transcripts, the full
// resolution of the dragon fight, and readable histories. Every decision is an ordinary session command.
class RedCragRecord {
  static readonly out = 'doc/playtests/red-crag';
  static readonly titles: Record<RedCragHistory, string> = {
    fire: 'Fireproofed, they fight, and run', theft: 'They wait for the dragon to hunt, and rob it',
    tribute: 'They pay the dragon',
  };
  static name(names: Record<string, string>, id: string): string { return names[id] ?? id; }
  static line(e: CombatEvent, names: Record<string, string>): string | undefined {
    switch (e.type) {
      case 'action': return `${RedCragRecord.name(names, e.command.actor)} uses ${e.command.ability}.`;
      case 'save': return e.kind
        ? `${RedCragRecord.name(names, e.target)} saves versus ${e.kind}: d20 ${e.die} + ${e.stat} ${e.modifier} + level ${e.level} + bonus ${e.bonus}`
          + ` = ${e.rolled} against ${e.difficulty}: ${e.success ? 'success' : 'failure'}.`
        : `${RedCragRecord.name(names, e.target)} saves (${e.stat}): ${e.rolled} against ${e.difficulty}: ${e.success ? 'success' : 'failure'}.`;
      case 'attack': return `${RedCragRecord.name(names, e.actor)} attacks ${RedCragRecord.name(names, e.target)} with ${e.weapon}:`
        + ` d20 ${e.die} needing ${e.need} (AC ${e.armorClass}, to-hit ${e.toHit}): `
        + `${e.success ? e.critical ? 'critical hit' : 'hit' : e.evaded ? 'evaded' : 'miss'}.`;
      case 'damage': {
        const m = e.modifiers;
        const how = m ? [m.halfSave ? 'halved by the save' : '', m.resistance ? `resistance ${m.resistance}` : '',
          m.bonus ? `bonus ${m.bonus}` : '', m.reduction ? `reduction ${m.reduction}` : '',
          m.critical ? `critical +${m.critical}` : ''].filter(Boolean).join(', ') : '';
        return `${RedCragRecord.name(names, e.target)} takes ${e.amount} ${e.damageType ?? ''} damage (rolled ${e.rolled}${how ? `; ${how}` : ''}); `
          + `${e.hp} HP left.`;
      }
      case 'death': return `${RedCragRecord.name(names, e.actor)} falls.`;
      case 'end': return `The fight ends: ${e.outcome} (${e.reason}).`;
      default: return undefined;
    }
  }
  static async run(history: RedCragHistory) {
    const steps: { command: string; event: CampaignEvent }[] = [];
    const s = await RedCragHistories.play(history, (command, event) => steps.push({ command, event }));
    const names = Object.fromEntries(s.campaign.state.creatures.map(c => [c.id, c.name]));
    const lines = [`# ${this.titles[history]}`, '',
      `Recorded by \`bun bin/record-red-crag.ts\` from \`${RedCragHistories.campaign}\`, seed \`${RedCragHistories.seed}\`.`,
      'Waiting steps are folded. Combat lines are the committed mechanical events.', ''];
    let waited = 0;
    for (const { command, event } of steps) {
      const seen = (event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text);
      if (command === 'wait' && !seen.length) { waited++; continue; }
      if (waited) { lines.push(`- *(waits ${waited * 10} minutes)*`); waited = 0; }
      lines.push(`- **${command}** (watch ${event.elapsed}, ${event.result})${event.response ? `: ${event.response}` : ''}`);
      for (const text of seen) { lines.push(`  - ${text}`); }
      for (const e of event.combat ?? []) {
        const text = this.line(e, names);
        if (text && event.action.includes('attack')) { lines.push(`  - ${text}`); }
      }
    }
    if (waited) { lines.push(`- *(waits ${waited * 10} minutes)*`); }
    lines.push('', `Outcomes observed (watch): \`${JSON.stringify(s.campaign.save(true).observations)}\`.`,
      `Company: ${s.campaign.state.creatures.filter(c => c.id.startsWith('world__party'))
        .map(c => `${c.name} ${c.state.hp}/${c.base.maxHp} HP`).join(', ')}.`, '');
    await writeFile(`${this.out}/${history}.md`, lines.join('\n'));
    await writeFile(`${this.out}/${history}.transcript.json`, `${JSON.stringify(s.transcript, null, 1)}\n`);
    const fight = steps.find(x => x.command.startsWith('attack('));
    if (fight) { await writeFile(`${this.out}/${history}.trace.json`, `${JSON.stringify(fight.event, null, 1)}\n`); }
  }
}
await mkdir(RedCragRecord.out, { recursive: true });
for (const history of ['fire', 'theft', 'tribute'] as const) { await RedCragRecord.run(history); }
console.log(`wrote ${RedCragRecord.out}`);
