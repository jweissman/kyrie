// `kyrie prose`: a campaign's own words, each under its id, to be read as an editor reads (the Third Night's friction
// 20: its author pulled every quoted string from the Kyr with a pattern, which put some under the wrong declaration).
// What the shared rules say is left out.
//   bin/kyrie prose <campaign.json>
import { PlaySession } from '../session/play-session';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import type { Module } from '../lang/module';

export class ProseTool {
  static readonly usage = 'usage: kyrie prose <campaign.json>';
  static async main(args: string[]): Promise<number> {
    const [path] = args;
    if (!path) { console.error(this.usage); return 2; }
    const session = await PlaySession.start(path, 'prose', NodeBundleSource.shared);
    console.log(this.lines(session.campaign.module).join('\n'));
    return 0;
  }
  // Under a heading for each kind of words: what is seen, said by rules and events, said in talk, told of an act, and
  // the endings, each line its id and its words.
  static lines(m: Module): string[] {
    const endings = new Set(m.entities.filter(e => e.type === 'ending').map(e => e.id));
    const rules = (m.rules ?? []).filter(r => this.own(r.id) && r.say);
    return [
      ...this.part('What is seen', (m.observations ?? []).filter(o => this.own(o.id)).map(o => [o.id, o.text])),
      ...this.part('What rules say', rules.filter(r => !endings.has(r.id)).map(r => [r.id, r.say!])),
      ...this.part('What is said in talk', m.actions.filter(a => this.own(a.id) && a.speaker && a.report)
        .map(a => [`${a.id} (${a.name})`, a.report!])),
      ...this.part('What an act tells', m.actions.filter(a => this.own(a.id) && !a.speaker && a.report)
        .map(a => [`${a.id} (${a.name})`, a.report!])),
      ...this.part('Endings', rules.filter(r => endings.has(r.id)).map(r => [r.id, r.say!]))];
  }
  // Of the campaign's own modules: not the shared rules, nor the canon every world holds.
  private static own(id: string): boolean { return id.includes('__') && !id.startsWith('canon__'); }
  private static part(title: string, rows: string[][]): string[] {
    return rows.length ? [`## ${title}`, '', ...rows.map(([id, text]) => `- **${id}**: ${text}`), ''] : [];
  }
}
