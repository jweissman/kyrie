// How the page is read: at what size, and whether the dice are told. Kept in this browser, and set on the page as
// attributes its stylesheet reads (data-size, data-rolls).
export interface Options { size: 'smaller' | 'usual' | 'larger'; rolls: 'shown' | 'hidden' }

export class ReaderOptions {
  static readonly key = 'kyr-options';
  static readonly usual: Options = { size: 'usual', rolls: 'shown' };
  static read(): Options {
    try {
      const kept = JSON.parse(localStorage.getItem(this.key) ?? '{}') as Partial<Options>;
      return { size: kept.size ?? this.usual.size, rolls: kept.rolls ?? this.usual.rolls };
    } catch { return { ...this.usual }; }
  }
  // Kept if the browser will keep it; worn for this visit either way.
  static write(options: Options) {
    try { localStorage.setItem(this.key, JSON.stringify(options)); } catch { /* not kept: a private window */ }
    this.apply(options);
  }
  static apply(options: Options) {
    const root = document.documentElement;
    root.dataset.size = options.size;
    root.dataset.rolls = options.rolls;
  }
}
