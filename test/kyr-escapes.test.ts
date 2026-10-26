import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { StatementParser } from '../src/lang/statement-parser';

// A Kyr string reads every escape its grammar allows (the architecture review's A25, from its probe lang-escapes):
// "it\'s late" and "\{closed\}" would not read, so no author could write a brace that named nothing.
describe('a Kyr string', () => {
  it('reads its escapes, and a brace escaped is told as a brace', async () => {
    expect(StatementParser.unquote(String.raw`"plain \"quoted\" text"`)).toBe('plain "quoted" text');
    expect(StatementParser.unquote(String.raw`"tab\x41"`)).toBe('tabx41');
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'esc/site.kyr': String.raw`Module esc "Escapes" { Place field "Field" is wilderness.
        Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
        Observe sign at yard when true "A sign on the door: \{closed\}. It\'s late.". }`,
      'esc/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'esc.campaign.json': JSON.stringify({ version: 1, name: 'esc', modules: [{ id: 'p', bundle: 'esc/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('esc.campaign.json'), 'esc', source);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text)).toContain("A sign on the door: {closed}. It's late.");
  }, 60000);
});
