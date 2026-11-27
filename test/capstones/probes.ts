import { HandbookCreationReferences } from '../../src/client/creation-references';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from '../support/tiny';
import { Gauntlet } from '../support/gauntlet';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import { PlaySession } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view';
import { Undertakings } from '../../src/presentation/undertakings';
import { Digest } from '../../src/session/digest';
import type { Status } from './features';

// What each capstone feature is observed to be, cheaply and in this process: a tiny Kyr world, a fight, a creation
// flow, a save round trip, or a static fact of the data and the page. Each says its status and what it saw. A probe
// never reads the claim: the claim is held equal to it (test/small/capstones.test.ts).
export interface Seen { status: Status; evidence: string }
const root = join(import.meta.dir, '..', '..');
const walk = (path: string): string[] => statSync(path).isDirectory()
  ? readdirSync(path).flatMap(n => walk(join(path, n))) : [path];
const text = (...dirs: string[]) => dirs.flatMap(d => existsSync(join(root, d)) ? walk(join(root, d)) : [])
  .filter(f => /\.(kyrt?|tsx?|json|css)$/.test(f)).map(f => readFileSync(f, 'utf8')).join('\n');
const found = (re: RegExp, ...dirs: string[]) => re.test(text(...dirs));

const hall = `
  Place hall "the hall" is room at 0, 0 indoors.
  Place cellar "the cellar" is room at 1, 0 indoors.
  Passage stair "the stair" is door between hall and cellar.
  Company party "You" of 1 at hall.
  Thing chest "an old chest" at hall { State shut "An old chest stands against the wall.". }
  Discovery cache "Under the chest's lining, a folded paper." { Found by searching hall. }
  Objective errand when true "Find what is hidden in the hall.".
  Goal false.`;

export class Probes {
  static readonly by: Record<string, () => Promise<Seen> | Seen> = {
    hybrid: () => {
      const t = text('src/cli/terminal.ts');
      const typed = /by its number among those led with, by its id, or by its words as printed/.test(t);
      const verbs = /\bgo north\b|verbAliases|synonyms/.test(t);
      return { status: typed && !verbs ? 'partial' : typed ? 'present' : 'absent', evidence: `typed choices ${typed}, free verbs ${verbs}` };
    },
    dialogue: () => {
      const topics = existsSync(join(root, 'data/rules/people.kyr')) && found(/Action ask\(/, 'data/rules');
      const checked = found(/Resolve check\([^)]*\)[^.]*\bask\b/, 'data/rules/people.kyr');
      return { status: topics && !checked ? 'partial' : topics ? 'present' : 'absent', evidence: `topics ${topics}, checked talk ${checked}` };
    },
    companions: () => {
      const recruit = found(/Action recruit\(/, 'data/rules'), approval = found(/Relation approval|approval\(/, 'data/rules');
      return { status: recruit && !approval ? 'partial' : recruit ? 'present' : 'absent', evidence: `recruit ${recruit}, approval ${approval}` };
    },
    endings: () => {
      const n = (text('data/adventures', 'data/campaigns').match(/\bEnding \w+/g) ?? []).length;
      return { status: n >= 2 ? 'present' : n ? 'partial' : 'absent', evidence: `${n} endings declared in authored adventures` };
    },
    boss: () => {
      // Every foe's blow is telegraphed now (src/telegraph.ts, test/small/telegraphs), a boss's with the rest: what a
      // boss still wants is its phases.
      const phases = found(/\bphase\b/i, 'src/battle.ts', 'src/tactics.ts', 'src/rules');
      return { status: phases ? 'present' : 'partial', evidence: `phases ${phases}; strong foes by level, telegraphed` };
    },
    injury: () => {
      const lasting = found(/Relation (wounded|cursed|blessed|maimed)/, 'data/rules');
      return { status: lasting ? 'present' : 'partial', evidence: `lasting wound, curse or blessing relations ${lasting}; conditions in a fight` };
    },
    equipment: () => ({ status: found(/Action equip_item\(/, 'data/rules') ? 'present' : 'absent', evidence: 'an equip act in the shared rules' }),
    encounters: () => {
      const bands = existsSync(join(root, 'scripts/encounter-bands.ts')) || found(/encounter/i, 'src/world/deep');
      return { status: bands ? 'present' : 'absent', evidence: `encounter bands and placed troubles ${bands}` };
    },
    weather: () => {
      const state = found(/Relation weather|weather\(/, 'data/rules'), telling = found(/weather/i, 'data/rules', 'src/lang/occasions.ts');
      return { status: state ? 'present' : telling ? 'partial' : 'absent', evidence: `weather state ${state}, weather in the telling ${telling}` };
    },
    schedules: () => {
      const planned = existsSync(join(root, 'src/campaign/planner.ts')), authored = found(/Schedule |schedule\(/, 'data/rules');
      return { status: authored ? 'present' : planned ? 'partial' : 'absent', evidence: `planned agents ${planned}, authored schedules ${authored}` };
    },
    worldstate: () => {
      const held = existsSync(join(root, 'data/rules/dominion.kyr')), control = found(/controls\(|holds\(.*faction/, 'data/rules');
      return { status: held && !control ? 'partial' : held ? 'present' : 'absent', evidence: `dominion rules ${held}, faction control of places ${control}` };
    },
    help: () => {
      const help = found(/'help'/, 'src/cli/terminal.ts'), auto = found(/autocomplete|completions?\(/i, 'src/cli/terminal.ts', 'src/cli/terminal-input.ts');
      return { status: help && !auto ? 'partial' : help ? 'present' : 'absent', evidence: `help ${help}, autocomplete ${auto}` };
    },
    keywords: () => {
      const names = found(/keyword|data-keyword|linkify/i, 'web/reader');
      return { status: names ? 'present' : 'partial', evidence: `names in the prose as shortcuts ${names}; every act is a row` };
    },
    responsive: () => {
      const specs = readdirSync(join(root, 'test')).filter(f => /browser/.test(f))
        .filter(f => /390|820|1180/.test(readFileSync(join(root, 'test', f), 'utf8'))).length;
      return { status: specs >= 3 ? 'present' : specs ? 'partial' : 'absent', evidence: `${specs} browser specs at phone or iPad sizes` };
    },
    tutorial: () => {
      const later = found(/contextual hint|hintFor|teachOnce/i, 'web/reader', 'src/presentation');
      return { status: later ? 'present' : 'partial', evidence: `later contextual hints ${later}; the opening teaches by doing` };
    },
    hooks: () => {
      const n = (text('data/rules').match(/\bRule \w+ when/g) ?? []).length;
      return { status: n >= 20 ? 'present' : n ? 'partial' : 'absent', evidence: `${n} rules with conditions and effects in the shared rules` };
    },
    offline: () => {
      const site = existsSync(join(root, 'src/cli/site-build.ts')), net = found(/https?:\/\/(?!localhost)[^'"\s]*\.(js|css|woff2?)\b/, 'web/reader/frame.css', 'web/index.html');
      return { status: site && !net ? 'present' : site ? 'partial' : 'absent', evidence: `static site build ${site}, remote assets ${net}` };
    },

    creation: () => {
      const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
      const flow = new CreationFlow({ title: 't', generated: true, pitch: { heading: '', text: '' },
        origins: [{ id: 'debt', title: 'A debt', choice: 'You owe' }], names,
        party: [Creation.protagonist('human', 'p', names)] }, Creation.catalog(), new HandbookCreationReferences());
      const ids: string[] = flow.steps().map(s => s.id);
      const has = ['name', 'calling', 'you', 'before', 'presenting'].every(i => ids.includes(i));
      return { status: has && !ids.includes('trait') ? 'partial' : has ? 'present' : 'absent', evidence: ids.join(' ') };
    },
    scene: async () => {
      const t = await Tiny.start(hall), search = t.journey.choices().find(c => /^Search/.test(c.label));
      if (!search) { return { status: 'absent', evidence: 'no search act offered' }; }
      await t.play(search.label);
      const o = PlayerView.observe(t.campaign);
      const seen = [...o.observations.map(x => x.text), ...o.knowledge.map(x => x.text)].join(' ') + JSON.stringify(t.campaign.history.at(-1)?.perceptions ?? []);
      return { status: /folded paper/.test(seen) ? 'present' : 'partial', evidence: `searched: ${/folded paper/.test(seen)}` };
    },
    quest: async () => {
      const t = await Tiny.start(hall), aims = Undertakings.held(t.campaign);
      t.follow('errand');
      return { status: aims.length && t.screen.aims?.some(a => a.followed) ? 'partial' : 'absent',
        evidence: `${aims.length} aim held, followed ${!!t.screen.aims?.some(a => a.followed)}` };
    },
    journal: async () => {
      const t = await Tiny.start(hall), notes = existsSync(join(root, 'web/reader/sheet.tsx'));
      const book = existsSync(join(root, 'data/handbook')) || existsSync(join(root, 'src/handbook'));
      return { status: notes && book && (t.screen.aims?.length ?? 0) > 0 ? 'present' : 'partial',
        evidence: `aims ${t.screen.aims?.length}, notes page ${notes}, handbooks ${book}` };
    },
    save: async () => {
      const t = await Tiny.start(hall);
      await t.play('Search here');
      const again = PlaySession.fromSave(t.campaign.save(), 'tiny');
      const same = Digest.of(again.campaign) === Digest.of(t.campaign);
      const slots = found(/saveSlots|slotName|named slot/i, 'web/reader', 'web/engine', 'src/session');
      return { status: same && !slots ? 'partial' : same ? 'present' : 'absent', evidence: `round trip same ${same}, slots ${slots}` };
    },
    time: async () => {
      const t = await Tiny.start(hall), before = t.campaign.readout.elapsed * 10 + (t.campaign.readout.minutes ?? 0);
      await t.play('Wait an hour');
      const after = t.campaign.readout.elapsed * 10 + (t.campaign.readout.minutes ?? 0);
      return { status: after > before ? 'present' : 'absent', evidence: `minutes ${before} to ${after}` };
    },
    map: async () => {
      const t = await Tiny.start(hall), way = t.journey.choices().find(c => /cellar/i.test(c.label));
      if (!way) { return { status: 'absent', evidence: 'no way offered' }; }
      await t.play(way.label);
      return { status: t.where() === 't__cellar' ? 'present' : 'partial', evidence: `at ${t.where()}` };
    },
    combat: () => {
      const r = Gauntlet.fight({ calling: 'warrior', foe: 'rat', count: 2 }, 'capstone');
      return { status: r.rounds > 0 ? 'present' : 'absent', evidence: `${r.rounds} rounds, won ${r.won}` };
    },
    status: () => {
      const n = (text('data/catalog/conditions.json', 'data/catalog/orsino/conditions.json').match(/"modifiers"/g) ?? []).length;
      const ticking = found(/"onTurnEnd"/, 'data/catalog/conditions.json');
      return { status: n >= 5 && ticking ? 'present' : 'partial', evidence: `${n} conditions with modifiers, ticking ${ticking}` };
    },
    checks: () => {
      const n = (text('data/rules').match(/Resolve check\(/g) ?? []).length;
      return { status: n > 0 ? 'present' : 'absent', evidence: `${n} authored checks in the shared rules` };
    },
    puzzles: () => {
      const door = existsSync(join(root, 'data/generation/works/riddle-door.kyrt'));
      const hints = found(/riddle.*hint|hint.*riddle/i, 'data/generation/works');
      return { status: door && !hints ? 'partial' : door ? 'present' : 'absent', evidence: `riddle door ${door}, hints ${hints}` };
    },
    progression: () => {
      const low = Gauntlet.fight({ calling: 'warrior', foe: 'rat', count: 1, level: 1 }, 'cap-a');
      const high = Gauntlet.fight({ calling: 'warrior', foe: 'rat', count: 1, level: 8 }, 'cap-a');
      return { status: high.rounds <= low.rounds ? 'present' : 'partial', evidence: `rounds at 1 ${low.rounds}, at 8 ${high.rounds}` };
    },
    inventory: () => {
      const weight = found(/encumbr|carryWeight|weightLimit|packSlots/i, 'src', 'data/rules');
      return { status: weight ? 'present' : 'partial', evidence: `weight or slot limits ${weight}` };
    },
    economy: () => {
      const haggle = found(/Action \w*haggle|haggle\(|check\(.*haggle/i, 'data/rules', 'src/campaign');
      const trade = existsSync(join(root, 'data/rules/services.kyr'));
      return { status: trade && !haggle ? 'partial' : trade ? 'present' : 'absent', evidence: `trade ${trade}, haggle ${haggle}` };
    },
    crafting: () => {
      const make = existsSync(join(root, 'data/rules/making.kyr')), learn = found(/knowsRecipe/, 'data/rules');
      return { status: make && !learn ? 'partial' : make ? 'present' : 'absent', evidence: `making ${make}, recipe knowledge ${learn}` };
    },
    survival: () => {
      const needs = existsSync(join(root, 'data/rules/needs.kyr')) && found(/hungry|rations/i, 'data/rules');
      return { status: needs ? 'present' : 'absent', evidence: `needs rules ${needs}` };
    },
    reputation: () => ({ status: found(/Relation reputation|Relation standing\(|reputation\(/, 'data/rules') ? 'partial' : 'absent',
      evidence: 'a reputation relation in the shared rules' }),
    legacy: () => ({ status: found(/newGamePlus|legacyPerk|carryOver/, 'src', 'web') ? 'partial' : 'absent', evidence: 'a carry-over of a game to the next' }),
    difficulty: () => ({ status: found(/difficulty/i, 'web/reader/options-page.tsx') ? 'partial' : 'absent',
      evidence: 'a difficulty setting on the options page' }),
    ironman: () => ({ status: found(/ironman|permadeath|hardcore/i, 'web', 'src/session') ? 'partial' : 'absent',
      evidence: 'a restricted-save mode' }),
    enchanting: () => ({ status: found(/Action \w*enchant/i, 'data/rules') ? 'partial' : 'absent', evidence: 'an enchanting act in the rules' }),
    dyslexia: () => ({ status: found(/dyslex|opendyslexic/i, 'web/reader') ? 'partial' : 'absent', evidence: 'a dyslexia font option' }),
    warnings: () => ({ status: found(/content warning|intensity/i, 'web/reader/options-page.tsx') ? 'partial' : 'absent',
      evidence: 'content toggles on the options page' }),
    locale: () => ({ status: found(/i18n|\.t\('|messages\[/, 'web/reader', 'src/presentation') ? 'partial' : 'absent', evidence: 'a string table by key' }),
    social: () => ({ status: found(/leaderboard|daily challenge|shared story/i, 'web', 'src/session') ? 'partial' : 'absent',
      evidence: 'a shared or social feature' }),
    textcontrols: () => {
      // The settings are the engine's Options page (OpeningPages, OR-382), drawn by the page's.
      const o = text('web/reader/options-page.tsx') + text('src/creation/opening-pages.ts');
      const size = /key: 'size'/.test(o), theme = /contrast|theme/i.test(o), speed = /speed/i.test(o);
      return { status: size && theme && speed ? 'present' : size ? 'partial' : 'absent', evidence: `size ${size}, themes ${theme}, speed ${speed}` };
    },
    scrollback: () => {
      const story = existsSync(join(root, 'web/reader/stage/story-stage.tsx')) || found(/exportTranscript/, 'web/reader');
      const search = found(/search the (log|story)|filterStory|storySearch/i, 'web/reader');
      return { status: story && !search ? 'partial' : story ? 'present' : 'absent', evidence: `log or transcript ${story}, search ${search}` };
    },
    screenreader: () => {
      const aria = (text('web/reader').match(/aria-/g) ?? []).length;
      return { status: aria > 20 ? 'partial' : 'absent', evidence: `${aria} aria attributes in the page` };
    },
    debug: () => ({ status: found(/has\('dev'\)/, 'web/reader') ? 'partial' : 'absent', evidence: 'a ?dev address' }),
    mods: () => ({ status: found(/campaign=/, 'web/reader') ? 'partial' : 'absent', evidence: 'campaigns loaded by address' }),
    versioning: () => ({ status: found(/BuildStamp|migrate/, 'src/session', 'web/engine') ? 'present' : 'absent',
      evidence: 'a build stamp and a version on a save' }),
    data: () => ({ status: existsSync(join(root, 'data/rules/core.kyr')) ? 'present' : 'absent', evidence: 'rules, places and items in Kyr data' }),
    validation: () => ({ status: existsSync(join(root, 'src/cli/kyr-lint.ts')) ? 'present' : 'absent', evidence: 'kyr-lint' }),
    procgen: () => ({ status: existsSync(join(root, 'src/world/frontier.ts')) || found(/class Frontier/, 'src') ? 'present' : 'absent',
      evidence: 'a seeded Frontier that draws countries' }),
  };
}
