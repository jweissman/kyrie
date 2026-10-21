import { Html } from './html';
import { Content, type CreatureGenerationContext } from '../src/content';
import { Canon } from '../src/canon/canon';
import { Overlays } from '../src/overlays';
import { CompanyPreview, type FormationPreview } from '../src/presentation/company-preview';
import { PlayOpening } from './play-opening';

export interface Draft { seed: string; party: CreatureGenerationContext[] }
interface Setting { name: string; pitch?: { heading: string; text: string } }
type Member = CreatureGenerationContext;

// Forming a company of three: who each is (ancestry, calling, specialization, background) and what that brings, and
// what the three are together: the skills they cover between them, the ones nobody has, and the formations (Orsino's
// party traits) they make or are one change away from.
export class PlayCreate {
  static render(draft: Draft, error: string, setting: Setting,
    options: { presets: { id: string; label: string; note: string }[]; generated: boolean }): string {
    const pitch = setting.pitch ?? { heading: setting.name, text: 'Choose three companions.' };
    const ready = options.presets.map(p => `<li>${Html.button(p.label, 'preset', { id: p.id })}`
      + `<small>${Html.escape(p.note)}</small></li>`).join('');
    const members = draft.party.map((p, i) => this.companion(p, i, options.generated)).join('');
    return `<div class="frame opening" data-mode="create"><header class="status"><b class="brand">${Html.escape(setting.name)}</b>`
      + '<span class="where">Form a company of three</span><time></time></header>'
      + `<main class="create-page"><section class="pitch"><h1>${Html.escape(pitch.heading)}</h1>`
      + `<div class="prose"><p>${Html.escape(pitch.text)}</p></div><h3>A ready company</h3><ul class="presets">${ready}</ul>`
      + `<label class="seed">Seed <small>the same seed makes the same draws</small>`
      + `<input data-field="seed" value="${Html.escape(draft.seed)}"></label></section>`
      + `<section class="companions" data-region="companions">${members}</section>`
      + `<section class="together" data-region="together">${this.together(draft.party)}</section></main>`
      + `<footer class="keys">${Html.button('Set out', 'start', { class: 'primary' }, '<kbd>⏎</kbd> ')}`
      + `${Html.button('Choose another campaign', 'campaigns')}</footer>${PlayOpening.toast(error)}</div>`;
  }
  private static companion(p: Member, i: number, generated: boolean): string {
    // Old friends who pass on news are placed by a generated region; an authored campaign has its own people.
    const view = { ...CompanyPreview.member(p), ...(generated ? {} : { contact: undefined }) };
    const brings = view.skills.map(k => `${Html.escape(k.name)} <small>${Html.escape(k.from)}</small>`).join(', ');
    const races = (Content.playableRaces as string[])
      .map(id => [id, Content.races[id as keyof typeof Content.races]?.name ?? id]);
    const classes = (Content.playableClasses as string[])
      .map(id => [id, Content.classes[id as keyof typeof Content.classes]?.name ?? id]);
    return `<fieldset class="companion" data-companion="${i}"><legend>${Html.escape(p.name || `Companion ${i + 1}`)}</legend>`
      + `<label>Name <input data-field="name" data-index="${i}" maxlength="40" value="${Html.escape(p.name ?? '')}"></label>`
      + `<label>Ancestry <select data-field="raceId" data-index="${i}">${this.options(races, p.raceId ?? '')}</select></label>`
      + `<label>Calling <select data-field="classId" data-index="${i}">${this.options(classes, p.classId ?? '')}</select></label>`
      + `${this.specialization(p, i)}<label>Background <select data-field="backgroundId" data-index="${i}">`
      + `${this.backgrounds(p)}</select></label><div class="practice prose"><p>${Html.escape(view.practice)}</p></div>`
      + `<dl>${brings ? `<dt>Brings</dt><dd>${brings}</dd>` : ''}`
      + `${view.gear.length ? `<dt>Carries</dt><dd>${Html.escape(view.gear.join(', '))}</dd>` : ''}`
      + `${view.contact ? `<dt>Knows</dt><dd>${Html.escape(view.contact)}</dd>` : ''}</dl>`
      + `${view.requires ? `<p class="warn">${Html.escape(view.requires)}</p>` : ''}</fieldset>`;
  }
  // What the three are together: skills covered and by whom, those nobody has, and formations made or nearly made.
  private static together(party: Member[]): string {
    const company = CompanyPreview.company(party), formations = CompanyPreview.formations(party);
    const covered = company.covered.map(c => `<li><b>${Html.escape(c.name)}</b> ${Html.escape(c.who.join(', '))}</li>`).join('');
    const searching = [...formations.formed, ...formations.near].some(f => f.perks.some(p => p.includes('searching')));
    return `<h2>Together</h2><h3>Between them</h3><ul class="covered">${covered}</ul>`
      + `${company.missing.length ? `<p class="none">No one has ${Html.escape(company.missing.join(', '))}.</p>` : ''}`
      + `${formations.formed.length ? `<h3>They make</h3><ul class="formations">${this.formations(formations.formed)}</ul>` : ''}`
      + `${formations.near.length ? `<h3>One change away</h3><ul class="formations near">${this.formations(formations.near.slice(0, 3))}</ul>` : ''}`
      + `${searching ? '<p class="none">A search finds what would take a skill to notice when the best searcher’s 10, '
        + 'Wisdom modifier and searching reach 15.</p>' : ''}`;
  }
  static formations(list: FormationPreview[]): string {
    return list.map(f => `<li><b>${Html.escape(f.name)}</b>${f.needs ? ` <small>${Html.escape(f.needs)}</small>` : ''}`
      + `${f.perks.map(p => `<p>${Html.escape(p)}</p>`).join('')}</li>`).join('');
  }
  // Orsino's trait choice for the class (a mage school, a cleric domain, a warrior's disposition), when it has one.
  private static specialization(p: Member, i: number): string {
    const choices = Canon.classes[Canon.resolve('classes', p.classId ?? '')]?.specializations ?? [];
    if (!choices.length) { return ''; }
    const forbidden = Canon.ancestries[p.raceId ?? '']?.forbiddenTraits ?? [];
    const options = [['', 'Drawn at random'], ...choices.filter(id => !forbidden.includes(id))
      .map(id => [id, Canon.traits[id]?.name ?? id])];
    return `<label>Specialization <select data-field="specialization" data-index="${i}">`
      + `${this.options(options, p.traits?.[0] ?? '')}</select></label>`;
  }
  // Backgrounds grouped by kind (wild country, the roads, a trade); those for another calling are left out unless
  // already chosen.
  private static backgrounds(p: Member): string {
    const ids = Object.keys(Overlays.catalog).filter(id => Overlays.has(id, 'background'));
    const open = ids.filter(id => id === p.backgroundId || !Canon.backgrounds[id]?.requiredClass
      || Canon.backgrounds[id]!.requiredClass === Canon.resolve('classes', p.classId ?? ''));
    const kinds = Object.keys(Canon.backgroundKinds)
      .filter(kind => open.some(id => Canon.backgrounds[id]!.kind === kind));
    return this.options([['', 'None']], p.backgroundId ?? '') + kinds.map(kind => `<optgroup label="${Html.escape(
      Canon.backgroundKinds[kind]?.name ?? kind)}">${this.options(open.filter(id => Canon.backgrounds[id]!.kind === kind)
      .sort((a, b) => Overlays.get(a).name.localeCompare(Overlays.get(b).name)).map(id => [id, Overlays.get(id).name]),
    p.backgroundId ?? '')}</optgroup>`).join('');
  }
  static options(entries: string[][], value: string): string {
    return entries.map(([id, name]) => `<option value="${Html.escape(id)}"${id === value ? ' selected' : ''}>`
      + `${Html.escape(name)}</option>`).join('');
  }
}
