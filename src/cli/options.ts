// A command's options: --name value, or a fallback.
export class Options {
  constructor(private readonly args: string[]) {}
  get(name: string, fallback: string): string {
    const i = this.args.indexOf(`--${name}`);
    return i >= 0 && this.args[i + 1] ? this.args[i + 1]! : fallback;
  }
}
