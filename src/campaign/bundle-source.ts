// Environment boundary for module bundles. Simulation code never reads files directly.
export interface BundleSource {
  read(path: string): Promise<string>;
  resolve(relative: string, from?: string): string;
}
export class BundlePaths {
  static dirname(path: string): string {
    const index = path.lastIndexOf('/');
    return index < 0 ? '.' : index === 0 ? '/' : path.slice(0, index);
  }
  static normalize(path: string): string {
    const rooted = path.startsWith('/'), parts: string[] = [];
    for (const part of path.split('/')) {
      if (part === '..') {
        if (parts.length && parts[parts.length - 1] !== '..') { parts.pop(); }
        else if (!rooted) { parts.push('..'); }
      } else if (part && part !== '.') { parts.push(part); }
    }
    return `${rooted ? '/' : ''}${parts.join('/')}`;
  }
}
