import { Tiny } from './tiny';
import { ModuleWriter } from '../../src/lang/module-writer';
import { Indicator } from '../../src/presentation/indicator';
import { Emphasis } from '../../src/presentation/emphasis';
import { TerminalSigns } from '../../src/cli/terminal-signs';
import type { Aspect } from '../../src/presentation/glance-types';

// How the atlas tells one opportunity, by where it lies and who is looking (the owner, 15 November: atlas perception,
// characterized; doc/architecture/mission-21/atlas-perception.md). A hamlet of four places in a line: the green where
// the company stands, the lane a step off, the yard two, and the shed beyond the yard's padlocked door. One kind of
// opportunity is put at one of them, as the shared rules write it (nothing is invented for the table), and the place is
// read as both clients read it: the page from the glance's acts, likenesses, sensed and idle ways; the terminal from
// its rows' indicators (TerminalSigns, Indicator.of).
export type Kind = 'companion' | 'danger' | 'payoff' | 'knowledge' | 'sign' | 'skilled-sign';
export type Where = 'green' | 'lane' | 'yard' | 'shed';
// absent: nothing; vague: something perceived off along a way, or a way gold for an aim, never what or who; dim: the
// way there drawn as having nothing new; clear: an act here, its facet drawn.
export type Reading = 'absent' | 'vague' | 'dim' | 'clear';
export interface Looking { calling?: string; gregarious?: boolean; aim?: boolean }

export class Atlas {
  static readonly ground = `
  Place hythe "Hythe" is settlement.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place lane "the lane" is room within hythe at 1, 0 outdoors.
  Place yard "the yard" is room within hythe at 2, 0 outdoors.
  Place shed "the shed" is room within hythe at 3, 0 indoors.
  Passage g_l "the lane gate" is path between green and lane.
  Passage l_y "the yard gate" is path between lane and yard.
  Passage y_s "the shed door" is door between yard and shed.
  Thing lock "the padlock" on y_s { State locked blocking "". State open "The padlock hangs open.".
    Change pick "Pick the padlock" from locked to open needing lockwork. }
  Company party "You" of 1 at green.
  Relation got(entity).
  Goal false.`;
  // Each kind as the shared rules write it, at a place; and the facet it is drawn with.
  static readonly facet: Record<Kind, Aspect> = { companion: 'companionship', danger: 'danger', payoff: 'payoff',
    knowledge: 'knowledge', sign: 'knowledge', 'skilled-sign': 'knowledge' };
  static put(kind: Kind, at: Where): string {
    switch (kind) {
      case 'companion': return `Person wenna "Wenna" at ${at} { Role "a girl with a bow". Ancestry human. Peaceable.
        Pronouns she. }
        Topic wenna_come with wenna "Ask Wenna whether she would come along" when true once { Says "'If you like.'".
        On discuss { Assert willing(wenna, actor). } }`;
      case 'danger': return `Person rats "the rats" at ${at} { Role "rats, fat and bold". Species rat. Numbers 2.
        Level 1. Lair ${at}. }`;
      case 'payoff': return `Item casket "a jewelled box" is jeweled_box at ${at}.`;
      case 'knowledge': return `Entity ford: fact "where the ford is".
        Person osric "Osric" at ${at} { Role "an eel-man". Ancestry human. Peaceable. Pronouns he. }
        Topic osric_ford with osric "Ask Osric about the ford" when true once { Says "'Below the alders.'".
        On discuss { Assert knows(actor, ford). } }`;
      case 'sign': return `Observe tracks at ${at} as sign when true "Fresh tracks cross the mud, all one way.".`;
      case 'skilled-sign': return `Observe tracks at ${at} as sign when capable(party, woodcraft) "Fresh tracks cross the mud, all one way.".`;
    }
  }
  static async start(kind: Kind, at: Where, o: Looking & { more?: string } = {}): Promise<Tiny> {
    // The aim names what is there where it is someone or something, as an errand would; a sign, by its place.
    const named: Partial<Record<Kind, string>> = { companion: 'wenna', danger: 'rats', payoff: 'casket',
      knowledge: 'osric' };
    const aim = !o.aim ? '' : named[kind] ? `Objective seek when not got(${named[kind]}) "Find {${named[kind]}}.".`
      : `Objective seek when true toward ${at} "Find what is at {${at}}.".`;
    const t = await Tiny.start(`${this.ground}\n${this.put(kind, at)}\n${aim}\n${o.more ?? ''}`,
      { party: [{ name: 'Aud', raceId: 'human', classId: o.calling ?? 'warrior' }] });
    if (o.gregarious) {
      t.campaign.commitWorld(t.world.apply([{ kind: 'assert', call: ModuleWriter.call('capable', 'party', 'gregarious') }]));
    }
    if (o.aim) { t.follow('seek'); }
    return t.look();
  }
  // The page's reading: an act here with the facet (or a likeness drawn with it), a way it is perceived along or gold
  // on for the aim, a way to it with nothing new, or nothing.
  static page(t: Tiny, facet: Aspect, at: Where): Reading {
    const g = t.glance, here = [...g.acts, ...g.offer?.primary ?? []];
    if (here.some(a => !a.choice.startsWith('exit:') && Emphasis.drawn(a.aspects, !!a.continues).includes(facet))
      || Object.values(g.likenesses ?? {}).some(l => l.aspects.includes(facet))) { return 'clear'; }
    if ((g.sensed ?? []).some(s => s.aspect === facet) || (facet === 'undertaking' && g.acts.some(a => a.continues))) {
      return 'vague';
    }
    return (g.idle ?? []).includes(`t__${at}`) ? 'dim' : 'absent';
  }
  // The terminal's: its rows, each by the indicator the shared grammar gives it.
  static terminal(t: Tiny, facet: Aspect, at: Where): Reading {
    const g = t.glance, signs = new TerminalSigns(t.screen, g);
    const rows = [...g.offer?.primary ?? [], ...g.offer?.rest ?? []].map(o => {
      const id = o.command ?? o.choice, s = signs.on(id);
      const ind = Indicator.of({ aspects: Emphasis.drawn(o.aspects, !!o.continues), ...s.sensed
        ? { sensed: { aspect: s.sensed, far: s.far ?? 1 } } : {} });
      // A way, or an act done at a way (looking at its padlock), is not the thing itself.
      const way = o.type === 'go' || o.type === 'journey' || o.choice.startsWith('exit:');
      return { id, way, ind, sensed: s.sensed, idle: s.idle };
    });
    const said = (r: typeof rows[number]) => r.ind.aspect === facet || r.ind.icons.some(i => i.sign
      === Indicator.icon(facet).sign);
    if (rows.some(r => !r.way && said(r))) { return 'clear'; }
    if (rows.some(r => r.way && (r.sensed === facet || (facet === 'undertaking' && r.ind.aspect === 'undertaking')))) {
      return 'vague';
    }
    return rows.some(r => r.idle) && (g.idle ?? []).includes(`t__${at}`) ? 'dim' : 'absent';
  }
}
