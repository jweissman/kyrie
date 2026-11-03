import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ObservationText } from '../src/lang/observation-text';
import { RuntimeCapabilities } from '../src/campaign/runtime-capabilities';
import { World } from '../src/lang/world';

// A count said in words where the author asks it: Garth said "I've lost 1 to them so far", and an aim "5 graves stand
// open" (play 9). A reading stays a figure ("The dial reads 12."), as a price in a choice's words does ("— 3 coin").
describe('a count in what is told', () => {
  const made = new ModuleCompiler(RuntimeCapabilities.signatures).instantiate(ModuleParser.parse(`Module t "T" {
    Kind group. Measure lost(group). Measure opened(group). Entity garth: group "Garth". Entity yard: group "the yard".
    Initially Set lost(garth) to 1. Initially Set opened(yard) to 14. Goal false. }`), 'k');
  const world = new World(made.module, made.world);
  it('is said in words where the author asks it, when it is small', () => {
    expect(ObservationText.render("'I have lost {lost(garth) in words} to them so far,' says {garth}.", world))
      .toBe("'I have lost one to them so far,' says Garth.");
    expect(ObservationText.render('{opened(yard) in words} graves stand open.', world)).toBe('14 graves stand open.');
  });
  it('stays a figure where it does not', () => {
    expect(ObservationText.render('The post stands at {lost(garth)}.', world)).toBe('The post stands at 1.');
    expect(ObservationText.render('Pay Garth — {lost(garth)} coin', world, false)).toBe('Pay Garth — 1 coin');
  });
});

// A phrase that agrees with its count, and a time kept of the watch said as the time it was (the Grand Tour's 09 and
// 11, GTR-X22: a count written by hand, "Half past ten" for a loosing at half past nine). The forms go with the name
// as a module is placed (scope), and two they must be.
describe('a count a phrase agrees with, and a time', () => {
  const made = new ModuleCompiler(RuntimeCapabilities.signatures).instantiate(ModuleParser.parse(`Module t "T" {
    Kind group. Measure left(group). Measure loosedAt(group). Entity rose: group "the rose". Entity pond: group "a pond".
    Initially Set left(rose) to 1. Initially Set left(pond) to 3. Initially Set loosedAt(rose) to 81. Goal false. }`), 'k');
  const world = new World(made.module, made.world);
  it('says the form that agrees, and the time of day', () => {
    expect(ObservationText.render('{left(rose) in words | petal is | petals are} still to set.', world))
      .toBe('One petal is still to set.');
    expect(ObservationText.render('Only {left(pond)|hollow has|hollows have} water.', world))
      .toBe('Only 3 hollows have water.');
    expect(ObservationText.render('The lanterns were loosed at {loosedAt(rose) as time}.', world))
      .toBe('The lanterns were loosed at 9:30 p.m.');
  });
  it('keeps its forms as it is placed, and asks for two', () => {
    expect(ObservationText.scope('{left(rose) in words|petal is|petals are}', c => ({ ...c, name: `x__${c.name}` })))
      .toBe('{x__left(rose) in words|petal is|petals are}');
    expect(ObservationText.scope('{loosedAt(rose) as time}', c => c)).toBe('{loosedAt(rose) as time}');
    expect(() => ObservationText.references('{left(rose)|petal}')).toThrow(/agrees by two forms/);
  });
});
