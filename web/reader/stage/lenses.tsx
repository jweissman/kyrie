import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Pip } from './pip';
import { AtHand } from './at-hand';
import { GlanceStage } from './glance';
import { SceneSurface } from './scene-surface';
import { Wayfinder, type Way } from './wayfinder';
import { Emphasis } from '../emphasis';

// The scene's lenses (the owner, 12 November: the cinematic study, made the one resting scene). Go and Look turned on
// show what they hold across the foot of the painting, as the talk lens shows who is here: a small tile for each way
// (its direction and name) or each thing at hand (its picture where it has one), with the one pip of what it is. A
// tile touched is chosen in the lens's own panel, where what it is and what can be done with it are said. The forward
// design's "attention lenses over one scene" (2026-11-11-forward-design.md, §G), tried on the page as it is.
// faint: what is only perceived off along a way (someone who might join you, that way), its pip soft (see Perception).
interface Tile { id: string; name: string; glyph?: string; picture?: string; tone?: string; faint?: boolean; dim?: boolean;
  chosen: boolean; pick: () => void }
export class Lenses {
  static Strip({ app }: { app: ReaderApp }) {
    const part = app.state.exploring, tiles = part === 'go' ? Lenses.ways(app) : part === 'look' ? Lenses.things(app) : [];
    if (!tiles.length) { return null; }
    return (
      <ul className={`lens-strip lens-${part}`} aria-label={part === 'go' ? 'Where you could go' : 'What is at hand'}>
        {tiles.map(t => <li key={t.id}>
          {/* One with a picture is its face and name; one without, its name and pip alone (a chip), with the way's
              direction where it goes out of the place. */}
          <button type="button" className={`lens-tile${t.picture ? '' : ' bare'}${t.chosen ? ' chosen' : ''}`
            + `${t.dim ? ' dim' : ''}`} data-tile={t.id} aria-pressed={t.chosen} onClick={t.pick}>
            {t.picture ? <span className="lens-face" aria-hidden="true"><img src={t.picture} alt="" decoding="async" /></span>
              : t.glyph && t.glyph !== '·' && <span className="lens-glyph" aria-hidden="true">{t.glyph}</span>}
            {t.tone && <Pip.View fill={`var(--tone-${t.tone})`} faint={t.faint} />}
            <span className="lens-name">{Typography.curl(Words.upper(t.name))}</span>
          </button></li>)}
      </ul>
    );
  }
  // At most this many tiles: those with something to them first (the aim's, a tone, someone perceived), then the rest
  // in the place's order, never the idle; the list in the panel holds every way (the first render had three rows of
  // eighteen tiles over the painting, saying again what the panel said).
  static readonly most = 6;
  // The ways from here, by the direction each goes and its short name; the aim's in its gold, as its row is.
  private static ways(app: ReaderApp): Tile[] {
    const glance = app.state.frame?.leaf.glance, idle = new Set(glance?.idle ?? []);
    const sensed = (w: Way) => glance?.sensed?.find(x => x.to === Wayfinder.to(w) || w.holds?.includes(x.to));
    return Wayfinder.ways(app).map((w): Tile => ({ id: w.c.id, name: GlanceStage.short(w.name),
      glyph: w.c.disabled ? '⊘' : SceneSurface.glyph(w.whither),
      ...(w.aim === 'followed' ? { tone: 'gold' } : Wayfinder.tone(app, w) ? { tone: Wayfinder.tone(app, w)! }
        : sensed(w) ? { tone: Emphasis.tones[sensed(w)!.aspect], faint: true } : {}),
      ...idle.has(Wayfinder.to(w)) ? { dim: true } : {}, chosen: app.state.hovered === w.c.id,
      // Touched, a way is gone by, as a likeness touched is spoken to (the owner, 12 November: a place's badge did not
      // go there); its row in Go's list still says what it is first.
      pick: () => Wayfinder.go(app, w) })).filter(t => !t.dim)
      .sort((a, b) => Number(!a.tone) - Number(!b.tone) || Number(b.tone === 'gold') - Number(a.tone === 'gold'))
      .slice(0, Lenses.most);
  }
  // The things at hand, by their pictures where the place's people or things have one.
  private static things(app: ReaderApp): Tile[] {
    const subjects = app.menu.scene?.subjects ?? [];
    return AtHand.of(app).map(h => {
      const picture = subjects.find(x => x.id === h.id)?.portrait?.src, tone = AtHand.tone(app, h);
      return { id: h.id, name: h.name, ...picture ? { picture } : {}, ...tone ? { tone } : {},
        chosen: app.state.hovered === h.id, pick: () => AtHand.pick(app, h) };
    });
  }
}
