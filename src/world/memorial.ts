// Someone who died in a country, as the country remembers them: their name, where they fell, and how.
export interface Memorial { name: string; place: string; how: string }

// Where someone who came before lies: a cairn where they fell, that a country begun again keeps. It is written with
// who comes into the country (company.kyr), the country itself being the same whoever comes.
export class Memorials {
  static remember(m: Memorial, files: Record<string, string>, region: string) {
    const place = m.place.replace(/^region__/, ''), q = JSON.stringify, path = `${region}/company.kyr`;
    const declared = Object.entries(files).some(([p, text]) => p.startsWith(`${region}/`) && text.includes(`Place ${place} `));
    if (!declared || !files[path]) { return; }
    const name = m.name.replace(/[{}]/g, '');
    const line = `  Observe memorial at ${place} as feature when true ${q(`Stones are heaped by the way here over ${name}, who died here. ${m.how} Someone has left a few flowers on the stones.`)}.`;
    // Put in as written, whatever is in the name ($ is no pattern here).
    const end = files[path]!.search(/\}\s*$/);
    files[path] = `${files[path]!.slice(0, end)}${line}\n}\n`;
  }
}
