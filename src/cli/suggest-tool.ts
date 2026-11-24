import { SuggestNames, type NameAsk } from './suggest-names';
import { SuggestPaintings } from './suggest-paintings';
import { SuggestAdventures } from './suggest-adventures';

// `kyrie suggest`: ideas for an author, drawn from what the setting already has and checked against what is taken.
//   kyrie suggest names [--kind given|family|place] [--people human] [--sex she|he|they] [--like <adventure>]
//                       [-n 12] [--seed <words>] [--order 2] [--scores]
//     New names in the manner of a people's (the setting's tables) or an adventure's own (--like), none of them given
//     by any adventure or the setting already, nor a beginning or a part of one; the shortest and best-sounding of
//     many drawn, best first (--scores says each one's); the same seed draws the same names.
//   kyrie suggest paintings [--terrain desert] | --needed | --write
//     The paintings of places that nothing uses yet, by terrain and subject, and what each terrain has no painting of;
//     --needed, the owner's scene paintings counted by terrain and subject, resting scenes first; --write puts that
//     table in doc/design/paintings-needed.md.
//   kyrie suggest adventure
//     The adventures by the facet each holds most, read from their Kyr; the least written of first, and what the
//     world's last quantity reading says beside them.
export class SuggestTool {
  static readonly usage = [
    'kyrie suggest names [--kind given|family|place] [--people human] [--sex she|he|they] [--like <adventure>]',
    '                    [-n 12] [--seed <words>] [--order 2] [--scores]',
    'kyrie suggest paintings [--terrain <terrain>] | --needed | --write',
    'kyrie suggest adventure',
  ].join('\n');
  static main(args: string[]): number {
    const [what, ...rest] = args;
    if (what === 'names') { return this.names(rest); }
    if (what === 'adventure') { console.log(SuggestAdventures.report().join('\n')); return 0; }
    if (what === 'paintings') { return this.paintings(rest); }
    console.log(this.usage);
    return what ? 1 : 0;
  }
  private static names(args: string[]): number {
    const kind = (this.option(args, '--kind') ?? 'given') as NameAsk['kind'];
    if (!['given', 'family', 'place'].includes(kind)) { console.error(this.usage); return 1; }
    const people = this.option(args, '--people') ?? 'human', like = this.option(args, '--like');
    if (!like && kind !== 'place' && !SuggestNames.peoples(kind).includes(people)) {
      console.error(`No ${kind} names for ${people}: ${SuggestNames.peoples(kind).join(', ')}`); return 1;
    }
    const sex = this.option(args, '--sex'), count = Number(this.option(args, '-n') ?? 12);
    const seed = this.option(args, '--seed') ?? `${Date.now()}`, order = Number(this.option(args, '--order') ?? 2);
    const ask: NameAsk = { kind, people, ...sex ? { sex } : {}, ...like ? { like } : {} };
    const ranked = SuggestNames.ranked(ask, { count, seed, order }), names = ranked.map(([n]) => n);
    console.log(ranked.map(([n, s]) => args.includes('--scores') ? `${n}\t${s.toFixed(2)}` : n).join('\n'));
    console.error(`${names.length} new ${kind} names (${like ? `as ${like} gives them` : kind === 'place' ? 'as the '
      + 'adventures name places' : `as ${people} ${sex ?? ''}`.trim()}), none given by any adventure or the setting, nor part of one;`
      + ` seed ${seed}`);
    return names.length ? 0 : 1;
  }
  private static paintings(args: string[]): number {
    if (args.includes('--write')) { SuggestPaintings.write(); console.log(`written: ${SuggestPaintings.list}`); return 0; }
    const lines = args.includes('--needed') ? SuggestPaintings.needed() : SuggestPaintings.report(this.option(args, '--terrain'));
    console.log(lines.join('\n'));
    return 0;
  }
  private static option(args: string[], name: string): string | undefined {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  }
}
