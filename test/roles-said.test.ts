import { describe, expect, it } from 'bun:test';
import { Narrator } from '../src/presentation/narrator';

// Who someone is, said after their name with the article it wants: "the innkeeper", "a pilgrim"; none before what
// already says whose they are ("a Master Harker's clerk": Liberty of the Ice friction 11), and a role that names them
// again said once ("Lady Wenlock, a Lady Wenlock": Hessel friction 10).
describe('a role said after a name', () => {
  it('takes the article it wants, and none it does not', () => {
    expect(Narrator.who({ name: 'Eamon, innkeeper' })).toBe('Eamon, the innkeeper');
    expect(Narrator.who({ name: 'Cyril, pilgrim' })).toBe('Cyril, a pilgrim');
    expect(Narrator.who({ name: 'Ida, apothecary' })).toBe('Ida, an apothecary');
    expect(Narrator.who({ name: "Silas Kemble, Master Harker's clerk, thin and ink-stained" }))
      .toBe("Silas Kemble, Master Harker's clerk, thin and ink-stained");
    expect(Narrator.who({ name: 'Wenlock, Lady Wenlock' })).toBe('Lady Wenlock');
    expect(Narrator.who({ name: 'Ghost, the inn’s dog' })).toBe('Ghost, the inn’s dog');
  });
});
