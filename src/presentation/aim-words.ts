import type { Entity, Objective } from '../lang/module';
import type { World } from '../lang/world';
import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Spatial } from '../spatial';

// An aim in words, naming no one the company cannot place. Someone an aim leads to (tell them, find them) whom the
// company has never spoken with, and whose town the aim does not name, is said as who they are and where they are
// found: "The dead in the tower are still. Kellen will want to know." had been all a company was told that broke the
// bone lantern without ever coming to the shrine Kellen keeps, and the map said "Not yet on your map: Kellen may know
// where" of the one it was looking for (the fresh playtest of 7 November). Now it reads "Kellen, priest of Belenus at
// Ramrehes, will want to know", and the map finds Ramrehes (see Undertakings.places). One already met, known by a name
// of the company's own for them ("an old man by the stove"), or found where the aim says (Ask Beak about the rats in
// the corn-store at Karir), is said by their name as before.
export class AimWords {
  // The aims the company holds, each by its id and in its words.
  static held(world: World, objectives: Objective[]): { id: string; text: string }[] {
    return objectives.filter(o => world.test(o.when)).map(o => ({ id: o.id, text: this.render(world, o) }));
  }
  static render(world: World, o: Objective): string {
    let text = o.text;
    for (const id of this.strangers(world, o)) {
      const at = text.indexOf(`{${id}}`), after = text.slice(at + id.length + 2);
      // Said between commas where the sentence goes on after them, and not where it ends with them.
      const shut = /^\s+[\p{L}'‘]/u.test(after) ? ',' : '';
      text = `${text.slice(0, at)}${this.introduced(world, id, o.text)}${shut}${after}`;
    }
    return ObservationText.render(text, world);
  }
  // Those the aim names whom it should say who they are: someone (said with a he, a she or a they), never spoken
  // with, called by their own name, and in a town or a site the aim does not name; never where the name is a
  // possessive ("Garth's flock"), which an aside would break, nor in a promise, which was made to their face.
  static strangers(world: World, o: Objective): string[] {
    const company = world.related('company')[0]?.args[0];
    if (!company || !world.relates('acquainted') || !world.relates('pronouns') || this.promised(o)) { return []; }
    const byId = EntityIndex.of(world.module.entities).byId, named = this.named(o);
    const said = ObservationText.render(o.text, world).toLowerCase();
    return [...new Set(named)].filter(id => {
      const e = byId.get(id), town = this.town(world, byId, id), at = o.text.indexOf(`{${id}}`);
      if (e?.type !== 'group' || id === company || !world.one('pronouns', id) || !town || at < 0) { return false; }
      if (world.test(ModuleWriter.call('acquainted', id, company)) || ObservationText.knownAs(world, e)) { return false; }
      // A town the aim names is not where they are found in it (the owner's own session, 7 November: "Ask Ulric about
      // what has come up under the churchyard at Elmford" sent a player to the churchyard and the shrine by guess):
      // they are said by the room they keep there, unless the aim names a place of that town already.
      return !/^['’]s\b/.test(o.text.slice(at + id.length + 2))
        && !(said.includes(ObservationText.label(world, town).toLowerCase()) && !this.room(world, byId, id, town))
        && !named.some(p => byId.get(p)?.space && Spatial.ancestry(byId, p).some(x => x.id === town));
    });
  }
  // Where someone is found, most particular first: the room they keep, and what it lies in short of the country.
  static whereabouts(world: World, id: string): string[] {
    const at = world.one('at', id), byId = EntityIndex.of(world.module.entities).byId;
    return at ? Spatial.ancestry(byId, at).filter(e => !['plane', 'region'].includes(e.space?.kind ?? ''))
      .map(e => e.id) : [];
  }
  private static introduced(world: World, id: string, text: string): string {
    const e = ObservationText.entity(world, id)!, [name, ...role] = e.name.split(', ');
    const byId = EntityIndex.of(world.module.entities).byId, town = this.town(world, byId, id);
    const said = ObservationText.render(text, world).toLowerCase(), room = town && this.room(world, byId, id, town);
    const place = town && said.includes(ObservationText.label(world, town).toLowerCase()) && room ? room : town;
    const where = place ? `at ${ObservationText.label(world, place).replace(/^The /, 'the ')}` : '';
    const what = [role.join(', '), where].filter(Boolean).join(' ');
    return what ? `${name}, ${what}` : name!;
  }
  // The room someone keeps within their town, where it is not the town itself (a shrine, a forge, a counting-house).
  private static room(world: World, byId: Map<string, Entity>, id: string, town: string): string | undefined {
    const at = world.one('at', id);
    return at && at !== town && byId.get(at)?.space ? at : undefined;
  }
  // The town, or the site, someone is in.
  private static town(world: World, byId: Map<string, Entity>, id: string): string | undefined {
    const at = world.one('at', id);
    return at ? Spatial.ancestry(byId, at).find(e => ['settlement', 'site'].includes(e.space?.kind ?? ''))?.id
      : undefined;
  }
  // Whether the aim is a promise the company made (see Promises.lower).
  private static promised(o: Objective): boolean {
    let made = false;
    ModuleWriter.conditionCalls(o.when, call => { made ||= call.name === 'promiseMade'; return call; });
    return made;
  }
  // The ids an aim's words name, in the order they are said.
  private static named(o: Objective): string[] {
    const ids: string[] = [];
    ObservationText.map(o.text, call => { ids.push(...call.args); return ''; }, id => { ids.push(id); return ''; });
    return ids;
  }
}
