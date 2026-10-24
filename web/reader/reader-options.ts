// How the page is read: by what light, at what size, and whether the dice are told. Kept in this browser, and set on
// the page as attributes its stylesheet reads (data-theme, data-size, data-rolls).
export interface Options { theme: 'device' | 'light' | 'dark'; size: 'smaller' | 'usual' | 'larger'; rolls: 'shown' | 'hidden' }

export class ReaderOptions {
  static readonly key = 'kyr-options';
  static readonly usual: Options = { theme: 'device', size: 'usual', rolls: 'shown' };
  static read(): Options {
    try { return { ...this.usual, ...JSON.parse(localStorage.getItem(this.key) ?? '{}') as Partial<Options> }; }
    catch { return { ...this.usual }; }
  }
  // Kept if the browser will keep it; worn for this visit either way.
  static write(options: Options) {
    try { localStorage.setItem(this.key, JSON.stringify(options)); } catch { /* not kept: a private window */ }
    this.apply(options);
  }
  static apply(options: Options) {
    const root = document.documentElement;
    if (options.theme === 'device') { delete root.dataset.theme; } else { root.dataset.theme = options.theme; }
    root.dataset.size = options.size;
    root.dataset.rolls = options.rolls;
  }
}
