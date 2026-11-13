import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { Signs } from '../../../src/presentation/signs';

// Holding an act rather than touching it (the owner, 14 November: "Initial character card selections as well as
// sustained actions in the game should all require long-touch"; "It makes the interface feel material without making
// it visually busier"). Not a button of its own: an option of the one act (Act.View, ChoiceRow, a creation card), with
// its focus, availability and atlas as they are. Pressed and held (a pointer, or Enter or Space on the act), an edge
// fills over the act's own box; let go early, nothing is done; held to the end, the act is done. No box moves while it
// fills (CN-06's stable geometry), and the edge is the act's own tone or neutral: a hold is no colour of its own.
// Presentation only: how long the hand is held is not how long the act takes in the world.
// The default (the owner, 14 November), no longer an experiment on the address.
export class Hold {
  // A sustained act (a search, a wait) a little longer than a commitment (who the character is).
  static readonly ms = { sustained: 850, commitment: 650 };
  // The page's keys holding an act drawn elsewhere than where the focus is (ReaderKeys: Enter on the highlight, a
  // digit): as a hand would, pressed on the act's own button, so the same edge fills and the same let-go undoes it.
  static press(button: Element) { button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 })); }
  static release(button: Element) { button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 })); }
  // What a held act spreads on its button, and whether it is being held now. ms: how long; done: the act itself.
  static use(ms: number | undefined, done: () => void) {
    const [held, hold] = useState(false), timer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    if (!ms) { return { held: false, props: {} }; }
    const start = () => {
      if (timer.current !== undefined) { return; }
      hold(true);
      timer.current = window.setTimeout(() => { timer.current = undefined; hold(false); done(); }, ms);
    };
    const stop = () => { window.clearTimeout(timer.current); timer.current = undefined; hold(false); };
    const keys = (e: KeyboardEvent<HTMLButtonElement>) => e.key === 'Enter' || e.key === ' ';
    return { held, props: {
      onPointerDown: (e: PointerEvent<HTMLButtonElement>) => { if (e.button === 0) { start(); } },
      onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop,
      // The page's own keys (a digit, Enter on the highlight) are not this act's: held here, they are its.
      onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
        if (keys(e)) { e.preventDefault(); e.stopPropagation(); if (!e.repeat) { start(); } }
      },
      onKeyUp: (e: KeyboardEvent<HTMLButtonElement>) => { if (keys(e)) { e.preventDefault(); stop(); } },
      // A touch alone does nothing: the hold does it.
      onClick: (e: MouseEvent<HTMLButtonElement>) => { e.preventDefault(); },
      'data-hold': ms >= Hold.ms.sustained ? 'sustained' : 'commitment',
      style: { '--hold-ms': `${ms}ms` } as CSSProperties,
    } };
  }
  // The edge that fills while it is held, over the act's own box; its tone the act's own, or neutral.
  static Edge({ held, tone }: { held: boolean; tone?: string }) {
    return held ? <span className="hold-edge" aria-hidden="true" style={tone ? { '--hold-tone': tone } as CSSProperties : undefined} />
      : null;
  }
  // What a reader of the page is told of it: that it is held.
  static readonly said = Signs.hold.said;
}
