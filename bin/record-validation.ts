#!/usr/bin/env bun
// Plays the validation campaign's sessions through the real session (what a player could choose, in order) and writes
// each as a transcript: what was chosen, what the game said, and how each fight went. A session may check that a
// save taken part-way resumes to the same game.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import type { CampaignEvent } from '../src/campaign/campaign-types';
import type { CreatureGenerationContext } from '../src/content';

interface Session { id: string; title: string; experience: string; company: string; seed: string; steps: string[];
  facts?: [string, ...string[]][]; save?: number; seen?: string[] }
interface Plan { campaign: string; sessions: Session[] }

class Recorder {
  static readonly root = resolve(import.meta.dir, '..');
  static company(id: string): CreatureGenerationContext[] {
    const presets = JSON.parse(readFileSync(join(this.root, 'data/campaigns/companies.json'), 'utf8')) as
      { companies: { id: string; members: CreatureGenerationContext[] }[] };
    return presets.companies.find(c => c.id === id)!.members;
  }
  static where(s: PlaySession): string {
    const here = s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
    return s.campaign.world.module.entities.find(e => e.id === here)?.name ?? here ?? '?';
  }
  static fight(e: CampaignEvent): string {
    const c = e.combat;
    if (!c.some(x => x.type === 'initiative')) { return ''; }
    const end = c.find(x => x.type === 'end');
    const actions = c.filter(x => x.type === 'action').length, reactions = c.filter(x => x.type === 'react').length;
    const summons = c.filter(x => x.type === 'summon').length, deaths = c.filter(x => x.type === 'death').length;
    return `*Fight: ${end && end.type === 'end' ? `${end.outcome} (${end.reason})` : 'unfinished'}; ${actions} actions, `
      + `${reactions} reactions, ${summons} summoned, ${deaths} fell.*`;
  }
  // What was said, what happened, and each sight the first time it is seen this session (so a place that has changed
  // shows its new face).
  static lines(e: CampaignEvent, seen: Set<string>): string[] {
    const told = [...(e.prelude?.perceptions ?? []), ...(e.perceptions ?? [])]
      .filter(p => p.kind !== 'observation' || !seen.has(p.id)).map(p => { seen.add(p.id); return `> ${p.text}`; });
    return [...e.response ? [e.response] : [], ...told, ...this.fight(e) ? [this.fight(e)] : []];
  }
  static async play(session: Session, campaign: string): Promise<string[]> {
    const s = await PlaySession.start(campaign, session.seed, NodeBundleSource.shared, this.company(session.company));
    const out = [`# ${session.title}`, '', `*${session.experience}. Company: ${session.company}; seed ${session.seed}.*`, ''];
    let saved: ReturnType<PlaySession['checkpoint']> | undefined, after: string[] = [];
    const seen = new Set<string>();
    for (const [i, step] of session.steps.entries()) {
      if (session.save === i) { saved = s.checkpoint(); after = []; session.seen = [...seen]; }
      const hit = PlayerView.choices(s.campaign).find(c => c.choice.name.startsWith(step));
      if (!hit) { out.push(`**Stopped: no choice "${step}" at ${this.where(s)}.**`); break; }
      const event = await s.perform(hit.choice.id);
      const lines = [`**${hit.choice.name}** — ${this.where(s)}`, '', ...this.lines(event, seen).flatMap(l => [l, '']).slice(0, -1), ''];
      out.push(...lines);
      if (saved) { after.push(...lines); }
    }
    if (saved) { out.push(...await this.resumed(saved, session, after)); }
    return out;
  }
  // Resumes the save and plays the rest again: the same choices must tell the same story.
  static async resumed(saved: ReturnType<PlaySession['checkpoint']>, session: Session, after: string[]): Promise<string[]> {
    const again = PlaySession.resume(JSON.parse(JSON.stringify(saved)));
    const lines: string[] = [], seen = new Set(session.seen ?? []);
    for (const step of session.steps.slice(session.save)) {
      const hit = PlayerView.choices(again.campaign).find(c => c.choice.name.startsWith(step));
      if (!hit) { break; }
      const event = await again.perform(hit.choice.id);
      lines.push(`**${hit.choice.name}** — ${this.where(again)}`, '', ...this.lines(event, seen).flatMap(l => [l, '']).slice(0, -1), '');
    }
    const same = lines.join('\n') === after.join('\n');
    return ['---', '', `*Saved before step ${session.save! + 1} and resumed: ${same ? 'the rest played out the same' : 'THE REST DIFFERED'}.*`, ''];
  }
}

const dir = resolve(process.argv[2] ?? 'doc/playtests/validation-2026-10-21');
const plan = JSON.parse(readFileSync(join(dir, 'plan.json'), 'utf8')) as Plan;
mkdirSync(dir, { recursive: true });
const only = process.argv[3];
for (const session of plan.sessions.filter(x => !only || x.id === only)) {
  const started = Date.now();
  const lines = await Recorder.play(session, plan.campaign);
  writeFileSync(join(dir, `${session.id}.md`), `${lines.join('\n')}\n`);
  console.log(`${session.id}: ${session.steps.length} steps in ${((Date.now() - started) / 1000).toFixed(1)} s`
    + `${lines.some(l => l.startsWith('**Stopped')) ? ' (stopped early)' : ''}`);
}
