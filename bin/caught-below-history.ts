#!/usr/bin/env bun
// Turns the recorded browser transcripts of "Caught Below" into readable histories (doc/playtests/caught-below/*.md),
// replaying each through the simulation and printing what the player was told. No prose is written by this script.
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';

export class CaughtHistory {
  static readonly dir = resolve(import.meta.dir, '../doc/playtests/caught-below');
  static async write(label: string) {
    const transcript = JSON.parse(await readFile(join(this.dir, `${label}.transcript.json`), 'utf8')) as Transcript;
    const s = await PlaySession.start(transcript.scenario, transcript.seed, NodeBundleSource.shared, transcript.party);
    let text = `# ${label}: actual browser history\n\nReplayed from \`${label}.transcript.json\` (${transcript.steps.length} commands).\n\n`;
    for (const step of transcript.steps) {
      const before = PlayerView.observe(s.campaign);
      await s.replay([step]);
      const f = ActionFeedbackView.read(s.campaign, s.campaign.events.at(-1)!, before);
      const moved = before.location?.id !== PlayerView.observe(s.campaign).location?.id;
      text += `**${f.attempt}** — ${f.time}\n\n`;
      for (const line of [...(moved && !f.events.length && !f.immediate.length ? [] : [f.result]), ...f.events,
        ...f.immediate.filter(l => !/ save \(|damage \(/.test(l)), ...f.resources, ...f.discoveries]) { text += `> ${line}\n\n`; }
    }
    await writeFile(join(this.dir, `${label}.md`), text);
  }
}

if (import.meta.main) {
  for (const label of ['river-desktop', 'quarry-desktop', 'quarry-phone']) { await CaughtHistory.write(label); }
}
