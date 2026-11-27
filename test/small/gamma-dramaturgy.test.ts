import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Content } from '../../src/content';
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleWriter } from '../../src/lang/module-writer';
import type { Module } from '../../src/lang/module';
import { Situations } from '../../src/lang/situations';
import { WhyProcess } from '../../src/cli/why-process';
import { ScenarioTowns } from '../../src/world/scenario-towns';
import { Tiny } from '../support/tiny';

const call = (name: string, ...args: string[]) => ModuleWriter.call(name, ...args);
const epic = `
  Place landing "the bell-landing" is room.
  Place archive "the drowned archive" is room.
  Place vault "the lower vault" is room.
  Place summit "the cloud-lit summit" is room.
  Company party "You" of 1 at landing.
  Person watchers "the island watchers" nowhere { Role "the watchers of the fall". Ancestry human. Peaceable. }
  Discovery bell "The bell below gives twice when the storm-line parts.".
  Discovery chart "The old chart puts the release gate under the archive.".
  Relation answered(group). Relation chartRead(group). Relation released(group). Measure urgency(group).
  Action ring_bell(actor: group) "Answer the storm-bell and call the watchers" {
    Requires able(actor) and at(actor, landing) and not answered(actor).
    On success {
      Assert answered(actor). Assert knows(actor, bell). Increase urgency(actor) by 1.
      Give rope to actor. Bring watchers to party.
    }
  }
  Passage archive_way "the stair into the archive" is steps between landing and archive
    opening when answered(party) "The storm-bell must first be answered.".
  Action read_chart(actor: group) "Read the floating chart before the ink dries" {
    Requires able(actor) and at(actor, archive) and knows(actor, bell) and not chartRead(actor).
    On success { Assert chartRead(actor). Assert knows(actor, chart). Set urgency(actor) to 2. }
  }
  Passage vault_way "the stair below the archive" is steps between archive and vault
    opening when knows(party, chart) "The release gate is still unnamed.".
  Action release_gate(actor: group) "Spend the rope and release the cloud-gate" {
    Requires able(actor) and at(actor, vault) and chartRead(actor) and holding(actor, rope)
      and not released(actor).
    On success { Spend rope from actor. Assert released(actor). Decrease urgency(actor) by 2. }
  }
  Passage summit_way "the cloud-stair" is steps between vault and summit
    opening when released(party) "The cloud-gate still holds.".

  Situation storm "The bell and the watchers" at landing {
    Core answer "the storm-bell is answered" of watchers resolved when answered(party).
    Turn "the watchers come and the archive stair answers" when answered(party) and at(watchers, landing).
    Done when at(party, archive).
  }
  Situation archive_trial "The chart and the hidden gate" when at(party, archive) {
    Core chart "the chart is read before it dries" resolved when chartRead(party) and knows(party, chart).
    Turn "the lower stair is named" when chartRead(party).
    Done when at(party, vault).
  }
  Situation release_trial "The rope at the cloud-gate" at vault {
    Core gate "the cloud-gate is released" resolved when released(party).
    Turn "the rope goes taut and the summit opens" when released(party).
    Done when at(party, summit).
  }
  Situation campaign "The three stories of the storm-road" when answered(party) {
    Core bell_trial "the bell story is resolved" resolved when at(party, archive) or at(party, vault) or at(party, summit).
    Core reading_trial "the chart story is resolved" resolved when chartRead(party).
    Core gate_trial "the gate story is resolved" resolved when released(party).
    Turn "the three local resolutions become one road onward" when at(party, vault) and chartRead(party) and released(party).
    Done when at(party, summit) and released(party).
  }
  Goal false.`;

type GeneratedRoute = { route: string; hazard: string };
const deemTables = {
  gammaSkyRoute: { discriminator: 'route', groups: { any: ['kite', 'sail', 'bell'] } },
  gammaSkyHazard: { discriminator: 'hazard', groups: { any: ['gust', 'silence', 'rain'] } }
};
const deemTemplates = {
  gamma_sky_trial: { __no_id: true,
    route: "=lookup(gammaSkyRoute, 'any')", hazard: "=lookup(gammaSkyHazard, 'any')" }
};

function routeModule(draw: GeneratedRoute): string {
  return `
    Place upper "the upper ledge" is room.
    Place lower "the lower ledge" is room.
    Company party "You" of 1 at upper.
    Kind route. Relation drawnRoute(route).
    Entity kite: route "kite". Entity sail: route "sail". Entity bell: route "bell".
    Initially Assert drawnRoute(${draw.route}).
    Action take_kite(actor: group) "Take the kite route" {
      Requires at(actor, upper) and drawnRoute(kite). On success { Assert crossed(actor). }
    }
    Action take_sail(actor: group) "Take the sail route" {
      Requires at(actor, upper) and drawnRoute(sail). On success { Assert crossed(actor). }
    }
    Action take_bell(actor: group) "Follow the bell route" {
      Requires at(actor, upper) and drawnRoute(bell). On success { Assert crossed(actor). }
    }
    Relation crossed(group).
    Passage down "the ${draw.hazard} crossing" is drift between upper and lower one way
      opening when crossed(party) "The ${draw.hazard} still holds the crossing shut.".
    Goal false.`;
}

function situationEdges(module: Module): { from: string; to: string; by: string[] }[] {
  const records = module.semantic?.filter(record => record.kind === 'situation') ?? [];
  const operations = [
    ...module.actions.map(action => ({ id: action.id, changes: [...action.success, ...action.failure] })),
    ...(module.rules ?? []).map(rule => ({ id: rule.id, changes: rule.effects }))
  ];
  return records.flatMap(record => {
    const reads = [...record.requires, ...record.phases.flatMap(phase => [phase.holds])]
      .flatMap(predicate => JSON.stringify(predicate).match(/"name":"([^"]+)"/g) ?? [])
      .map(value => value.slice(8, -1));
    return records.filter(other => other !== record && other.writes.some(write => reads.includes(write)))
      .map(other => ({ from: other.name, to: record.name,
        by: operations.filter(operation => operation.changes.some(change => other.writes.includes(change.call.name)))
          .map(operation => operation.id) }));
  });
}

describe('Gamma dramaturgy and semantic reconstruction', () => {
  it('coordinates three independent trials into one causal road without local coordinates', async () => {
    const t = await Tiny.start(epic);
    expect(t.campaign.module.entities.filter(entity => entity.type === 'place' && entity.id.startsWith('t__'))
      .every(entity => entity.space?.grid === undefined)).toBe(true);
    const records = t.campaign.module.semantic!.filter(record => record.kind === 'situation');
    expect(records.map(record => record.name).sort()).toEqual(['archive_trial', 'campaign', 'release_trial', 'storm']);
    expect(Situations.lint(t.campaign.module)).toEqual([]);
    const phase = (name: string) => WhyProcess.phase(t.journey, records.find(record => record.name === name)!)?.id;
    expect([phase('storm'), phase('archive_trial'), phase('release_trial'), phase('campaign')])
      .toEqual(['answer', 'before', 'before', 'before']);
    await t.play('Answer the storm-bell and call the watchers');
    expect(t.world.test(call('at', 't__watchers', 't__landing'))).toBe(true);
    expect(t.world.test(call('holding', 'party', 'rope'))).toBe(true);
    await t.play('To the drowned archive');
    expect(phase('storm')).toBe('done');
    expect(phase('archive_trial')).toBe('chart');
    await t.play('Read the floating chart before the ink dries');
    await t.play('To the lower vault');
    expect(phase('archive_trial')).toBe('done');
    expect(phase('release_trial')).toBe('gate');
    await t.play('Spend the rope and release the cloud-gate');
    await t.play('To the cloud-lit summit');
    expect([phase('release_trial'), phase('campaign')]).toEqual(['done', 'done']);
    expect(t.world.number(call('t__urgency', 'party'))).toBe(0);
  });

  it('retains situation predicates but not a cross-situation causal declaration', async () => {
    const t = await Tiny.start(epic);
    const records = t.campaign.module.semantic!.filter(record => record.kind === 'situation');
    const campaign = records.find(record => record.name === 'campaign')!;
    expect(campaign.effects).toEqual([]);
    expect(campaign.writes).toEqual([]);
    expect(campaign.participants).toEqual([]);
    expect(campaign.lowered.rules).toEqual([]);
    expect(records.map(record => record.serves)).toEqual([[], [], [], []]);
    expect(situationEdges(t.campaign.module)).toEqual([]);
    const report = WhyProcess.report(t.journey, campaign, []);
    expect(report.join('\n')).toContain('affected by:');
    expect(report.join('\n')).not.toContain('  leads to:');
  });

  it('uses Deem variations as ordinary Kyr availability conditions', async () => {
    const setting = Content.settingWith(deemTables as never, deemTemplates as never);
    const draws = new Map<string, GeneratedRoute>();
    for (let index = 0; draws.size < 3 && index < 160; index++) {
      const draw = new Content(`gamma-sky-${index}`, setting).generate('gamma_sky_trial') as unknown as GeneratedRoute;
      draws.set(draw.route, draw);
    }
    expect([...draws.keys()].sort()).toEqual(['bell', 'kite', 'sail']);
    for (const [route, draw] of draws) {
      const t = await Tiny.start(routeModule(draw));
      const offered = t.journey.choices().filter(choice => /^t__take_/.test(choice.command))
        .map(choice => choice.command);
      expect(offered).toHaveLength(1);
      expect(offered[0]).toContain(`take_${route}`);
      await t.perform(offered[0]!);
      expect(t.world.test(call('t__crossed', 'party'))).toBe(true);
      expect(t.journey.choices().some(choice => choice.command.includes('t__down'))).toBe(true);
    }
  });

  it('reconstructs strategic placement as a coordinate-free topology the assembler already understands', () => {
    const manifest = JSON.parse(readFileSync('data/scenarios/fellowship.scenario.json', 'utf8')) as {
      places: Record<string, { settlement: string }>;
    };
    const needs = Object.values(manifest.places).map(place => place.settlement);
    expect(needs).toEqual(['largest', 'along:a', 'along:b', 'along:c']);
    expect(needs.every(need => ScenarioTowns.forms.some(form => form.endsWith(':')
      ? need.startsWith(form) : need === form))).toBe(true);
    expect(JSON.stringify(needs)).not.toMatch(/\d+\s*,\s*\d+/);
    expect(needs.map(need => need.startsWith('along:') ? need.slice(6) : null))
      .toEqual([null, 'a', 'b', 'c']);
  });
});

describe('Gamma missing dramatic forms', () => {
  it('refuses Story, Epic and Campaign as language declarations today', () => {
    for (const declaration of ['Story', 'Epic', 'Campaign']) {
      expect(() => ModuleParser.parse(`Module x "X" { ${declaration} wide "A wider arc". Goal false. }`))
        .toThrow(/Expected/);
    }
  });
});
