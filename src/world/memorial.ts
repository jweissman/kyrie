// Someone who died in a country, as the country remembers them: their name, where they fell, and how.
export interface Memorial { name: string; place: string; how: string }

// Where someone who came before lies: a cairn where they fell, that a country begun again keeps.
export class Memorials {
  static remember(m: Memorial, files: Record<string, string>, path: string) {
    const place = m.place.replace(/^region__/, ''), q = JSON.stringify;
    if (!files[path]?.includes(`Place ${place} `)) { return; }
    const line = `  Observe memorial at ${place} as feature when true ${q(`Stones are heaped by the way here over ${m.name}, who died here. ${m.how} Someone has left a few flowers on the stones.`)}.`;
    files[path] = files[path]!.replace(/\}\s*$/, `${line}\n}\n`);
  }
}
