import type { Frame } from '../../engine/protocol';

// The page a frame holds the player to, whatever they were attending to: a fight, to its last blow and how it ended,
// even a fight that ended the story; and then the end. The end had come first, so that the act last chosen in a fight
// that ended the story, and what came of it, went unseen (the cold playtest: "my last strike's result never shown",
// the register's CMB-02).
export class Held {
  static page(frame: Frame): 'combat' | 'fallen' | undefined {
    if (frame.combat) { return 'combat'; }
    return frame.screen.running ? undefined : 'fallen';
  }
}
