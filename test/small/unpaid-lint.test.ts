import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { CampaignLint } from '../../src/cli/campaign-lint';
import { AuthorLint } from '../../src/cli/author-lint';

// A topic that pays the company out of someone's purse, who has less and is never given more, is never offered, and
// nothing said why (the Kyr requests' R43: four "Ask the keeper how the muster went" paid eight from a keeper with
// none). `kyrie lint` says so; asking it, `… or to nothing`, or a purse filled in play, is the author's.
const inn = (pay: string, rest = '') => `
  Place hall "the hall" is room at 0, 0 indoors.
  Company party "You" of 1 at hall.
  Person keeper "Hob" at hall { Role "the innkeeper". Peaceable. Greets "Well?". }
  Topic muster with keeper "Ask Hob how the muster went" when true once {
    Says "'Paid,' he says.". On discuss { ${pay} Increase quantity(actor, gold) by 8. } }
  ${rest}
  Goal false.`;
const unpaid = async (pay: string, rest?: string) => {
  const l = new CampaignLint('tiny', (await Tiny.start(inn(pay, rest))).session);
  AuthorLint.unpaid(l);
  return l.findings.map(f => `${f.level} ${f.check}: ${f.message}`);
};

describe('a purse that cannot pay', () => {
  it('is said where the one who pays has less and nothing gives them more', async () => {
    expect(await unpaid('Decrease quantity(keeper, gold) by 8.')).toEqual(['warning unpaid: Topic t__muster takes 8 '
      + 'gold from t__keeper, who has 0: it is not offered while they have less; ask quantity(t__keeper, gold) >= 8, '
      + 'or write `Decrease … or to nothing`']);
  });
  it('is not said where it is asked, paid to nothing, or the purse is filled in play', async () => {
    expect(await unpaid('Decrease quantity(keeper, gold) by 8 or to nothing.')).toEqual([]);
    expect(await unpaid('Decrease quantity(keeper, gold) by 8.', 'Rule takings when hour(clock) >= 20 '
      + '{ Increase quantity(keeper, gold) by 10. }')).toEqual([]);
    expect(await unpaid('Decrease quantity(keeper, gold) by 8.', 'Initially Set quantity(keeper, gold) to 12.'))
      .toEqual([]);
  });
});
