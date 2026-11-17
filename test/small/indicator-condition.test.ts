import { describe, expect, it } from 'bun:test';
import { Indicator } from '../../src/presentation/indicator';

// The opportunity indicator's two dimensions (M22, mission-22/indicator-appendix.md): the hue is what kind of
// opportunity is perceived (gold, red, green, blue, violet; a companion and somewhere worth a look are icons), and the
// condition is how it stands, from what the engine knows, said by value and shape and never by another hue. The
// owner's six cases, each as the engine types it.
const kind = (aspects: Parameters<typeof Indicator.of>[0]['aspects']) => {
  const i = Indicator.of({ aspects });
  return { tone: i.tone, icons: i.icons.map(x => x.said) };
};
describe('the opportunity indicator', () => {
  it('draws the kind by hue, and a companion or a way worth a look by icon alone', () => {
    // A followed debt's next step; a dangerous opponent seen; a recruitable companion; a distant wonder.
    expect([kind(['undertaking']).tone, kind(['danger']).tone, kind(['wonder']).tone]).toEqual(['gold', 'red', 'violet']);
    expect(kind(['companionship'])).toEqual({ tone: undefined, icons: ['a companion'] });
    // Several at once: one hue by precedence, the rest icons (TP-02), never a prism.
    expect(kind(['knowledge', 'danger', 'companionship']).tone).toBe('red');
  });
  it('draws nothing for what the company does not know: a clue still hidden carries no aspect, so no indicator', () => {
    expect(Indicator.of({})).toEqual({ icons: [], detail: [] });
  });
  it('says the condition from what the engine gives, the withdrawn before the far before the near', () => {
    const c = (s: Parameters<typeof Indicator.condition>[0]) => Indicator.condition(s).condition;
    // The distant wonder perceived along a way; a place known only by word; a place with nothing new to give
    // (a depleted location); a question put already.
    expect([c({}), c({ afar: true }), c({ heard: true }), c({ idle: true }), c({ spent: true })])
      .toEqual(['present', 'afar', 'heard', 'idle', 'spent']);
    expect([c({ afar: true, heard: true }), c({ heard: true, idle: true }), c({ idle: true, spent: true })])
      .toEqual(['heard', 'idle', 'spent']);
  });
  it('lets novelty add to what is present, never revive what is spent or far', () => {
    expect([Indicator.condition({ fresh: true }).fresh, Indicator.condition({ fresh: true, spent: true }).fresh,
      Indicator.condition({ fresh: true, afar: true }).fresh]).toEqual([true, false, false]);
  });
});
