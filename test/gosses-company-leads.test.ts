import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Gosse and Hepzibah lead somewhere after their first lines (US-06): the week's first step is the book, in a parcel
// left with Merriman for whoever played the Fool, and the proof is Gosse's old playbill in the property chest. Each
// link is said by someone the company meets, by the labels a player sees.
const city = 'test/fixtures/gosse/city.campaign.json';
const knows = (j: Journey, fact: string) => j.holds('knows', 'party', `pentrice__${fact}`);

describe('Gosse and Hepzibah lead on from their first lines', () => {
  it('in the loft before the yard, both send the company to Merriman for the book', async () => {
    const j = await Journey.start(city, 'g1');
    await j.play('To the Westgate', 'Into the Painted Moon', 'stable loft');
    expect(j.offers('Ask Hepzibah what she is waiting for')).toBe(true);
    await j.play('Ask Gosse what the company needs before its night');
    expect(knows(j, 'book_awaited')).toBe(true);
  }, 120000);
  it('told of the parcel for the Fool, Gosse owns to it and names the bill in Hepzibah\'s chest', async () => {
    const j = await Journey.start(city, 'g1');
    await j.play('To the Westgate', 'Into the Painted Moon', 'Ask Merriman whether anything', 'stable loft');
    expect(j.offers('Ask Gosse what the company needs before its night')).toBe(false);
    const said = await j.play('Tell Gosse a parcel waits in the yard');
    expect(said).toMatch(/property chest/);
    await j.play('Ask Gosse whether the company needs', 'Tell Gosse you will take service');
    expect(j.offers('Ask Hepzibah to open the property chest')).toBe(true);
  }, 120000);
});
