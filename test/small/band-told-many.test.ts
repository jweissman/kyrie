import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { CreatureFacts } from '../../src/campaign/creature-facts';

// A band a generated place is written with is told as many, however many it numbers (OR-692, cold plays 2 and 3:
// "The rats come up into the working face stands its ground and watches you"). A band of one drawn for a company of
// one (undertown.kyrt's {brood}) is many by its name alone (CreatureFacts.temperament), so its name reads as many: a
// plural head before its place, never a clause.
describe('a band a generated place is written with', () => {
  it('is named as many', () => {
    const files = readdirSync('data/generation', { recursive: true }).map(String).filter(f => f.endsWith('.kyrt'));
    const bands = files.flatMap(f => [...readFileSync(`data/generation/${f}`, 'utf8')
      .matchAll(/Person (\{\w\}_\w+) "([^"]*)"[^{\n]*\{([^\n]*\n[^\n]*)/g)]
      .filter(m => /Numbers (\{\w+\}|[2-9])/.test(m[3]!)).map(m => ({ at: `${f}: ${m[1]}`, name: m[2]! })));
    expect(bands.length).toBeGreaterThan(5);
    // A name its number chooses ("{wolves}": the wolf, or the wolves) and a body of many ("the king's household")
    // are told as they are named.
    const chosen = (n: string) => /^\{\w+\}/.test(n) || /\b(household|crew|pack|swarm|brood)$/.test(n);
    expect(bands.filter(b => !chosen(b.name) && !CreatureFacts.plural(b.name)).map(b => `${b.at} "${b.name}"`)).toEqual([]);
  });
  it('is given words of many where one is given a verb of one', () => {
    const words = new Map([...readFileSync('data/rules/inhabitants.kyr', 'utf8')
      .matchAll(/Entity (temper_words_\w+): fact "([^"]*)"/g)].map(m => [m[1]!, m[2]!]));
    const one = [...words].filter(([id, text]) => !/_(many|person)$/.test(id)
      && /\{\?g\} (?!will |can |may |must )[a-z]+s\b|, \{\?g\} [a-z]+s\b/.test(text)).map(([id]) => id);
    expect(one.length).toBeGreaterThan(5);
    expect(one.filter(id => !words.has(`${id}_many`))).toEqual([]);
  });
});
