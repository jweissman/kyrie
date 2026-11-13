import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';

// What a fight leaves in the world is the world's from then on: the foe that fell lies where it fell, dead, and offers
// nothing more, the company's wounds are its own until they are tended, and both hold in a game kept and
// opened again. One gallery and a wolf in it.
const gallery = `
  Place fell "the fellside" is room at 0, 0 outdoors.
  Place den "the den" is room at 1, 0 outdoors.
  Passage mouth "the den mouth" is path between fell and den.
  Company party "You" of 1 at den.
  Person wolf "a grey wolf" at den { Role "a wolf that lairs here". Species wolf. }
  Goal false.`;
const hp = (s: PlaySession) => s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id))
  .map(c => c.state.hp);

describe('after a fight', () => {
  it('the fallen lie dead and offer nothing, the wounds stay, and both are kept', async () => {
    const t = await Tiny.start(gallery), full = hp(t.session);
    const attack = t.journey.choices().find(c => /^attack\(/.test(c.command))!.command;
    const fought = await t.session.leg(attack);
    expect(fought.combat.some(e => e.type === 'end')).toBe(true);
    t.look();
    expect(t.journey.choices().some(c => /^attack\(/.test(c.command))).toBe(false);
    const wolf = t.screen.people.find(p => p.id === 't__wolf');
    expect([wolf?.state, wolf?.acts]).toEqual(['dead', []]);
    expect(t.world.test({ kind: 'call', name: 'dead', args: ['t__wolf'] })).toBe(true);
    const after = hp(t.session);
    expect(after.every((h, i) => h <= full[i]!)).toBe(true);
    const kept = PlaySession.resume(t.session.checkpoint());
    expect(hp(kept)).toEqual(after);
    expect(kept.canonical()).toBe(t.session.canonical());
  });
});
