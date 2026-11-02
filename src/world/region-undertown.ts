import type { Region, Settlement } from './region-writer';

// What lies under the town the company begins in: an adventure a step from its door, with no journey to make first
// (the owner, 1 November: "we shouldn't have to explore to start an adventuring loop"). Three ways down off the
// green, each with its own trouble and someone in the town who will pay to be rid of it: rats under the old
// corn-store (the merchant), the dead stirring in the catacombs under the churchyard (the priest), spiders in the
// old quarry's workings (whoever keeps travellers). Below them the three meet in an undercroft older than the town,
// and under that, found only by searching it, a sealed vault and what keeps it.
export class RegionUndertown {
  static readonly q = JSON.stringify;
  static lines(region: Region, s: Settlement): string[] {
    const t = s.id, q = this.q;
    return [
      // Up on the town: three ways down.
      `  Place ${t}_u_store "the old corn-store" is room within ${t} at 0, 1 indoors.`,
      `  Passage ${t}_u_store_door "the corn-store door" is door between ${t}_green and ${t}_u_store.`,
      `  Place ${t}_u_yard "the churchyard" is room within ${t} at 1, 2 outdoors.`,
      `  Passage ${t}_u_yard_gate "the lych-gate" is gate between ${t}_green and ${t}_u_yard.`,
      `  Place ${t}_u_pit "the old quarry pit" is room within ${t} at 2, 2 outdoors.`,
      `  Passage ${t}_u_pit_path "the path down into the old quarry" is path between ${t}_green and ${t}_u_pit taking 5 minutes.`,
      `  Observe ${t}_u_store_scene at ${t}_u_store as fixture when true ${q('Sacks stacked to the rafters, and the smell of mice; a trapdoor in the floor with a sack of grain weighting it down, and gnawed holes along the foot of every wall.')}.`,
      `  Observe ${t}_u_yard_scene at ${t}_u_yard as fixture when true ${q(`Old stones leaning in the grass, and in the corner by the wall a low stone door into the ground, its iron ring bright where someone has pulled at it lately.`)}.`,
      `  Observe ${t}_u_pit_scene at ${t}_u_pit as fixture when true ${q(`A bowl of grey stone cut out of the hill long ago, ivy over its faces; at the bottom, a square adit goes back into the rock, roped across, and a board on the rope says KEEP OUT in three hands.`)}.`,
      ...this.down(t), ...this.below(t), ...this.vault(t), ...this.errands(region, s),
    ];
  }
  // The three sections, a stair or adit apiece, two rooms each, each with its own trouble.
  private static down(t: string): string[] {
    return [
      `  Place ${t}_u_cellar "the corn-store cellar" is room within ${t} at 0, 3 underground.`,
      `  Passage ${t}_u_trap "the trapdoor" is stair between ${t}_u_store and ${t}_u_cellar.`,
      `  Place ${t}_u_warren "the rat-runs" is room within ${t} at 0, 4 underground.`,
      `  Passage ${t}_u_runs "a hole gnawed through the cellar wall" is crawl between ${t}_u_cellar and ${t}_u_warren.`,
      `  Person ${t}_u_rats "the rats under the corn-store" at ${t}_u_warren {`,
      '    Role "rats as big as cats, that have eaten their way into the corn-store from below". Species rat. Numbers 4. Level 1. Temperament territorial. Lair ' + `${t}_u_warren.`,
      '  }',
      `  Place ${t}_u_crypt "the crypt" is room within ${t} at 1, 3 underground.`,
      `  Passage ${t}_u_crypt_stair "the stone stair under the churchyard" is stair between ${t}_u_yard and ${t}_u_crypt.`,
      `  Place ${t}_u_ossuary "the ossuary" is room within ${t} at 1, 4 underground.`,
      `  Passage ${t}_u_bone_arch "an arch stacked round with skulls" is arch between ${t}_u_crypt and ${t}_u_ossuary.`,
      `  Person ${t}_u_dead "the hungry dead of the ossuary" at ${t}_u_ossuary {`,
      '    Role "dead things that have come up out of the bone-heaps hungry". Species ghoul. Numbers 2. Level 1. Lair ' + `${t}_u_ossuary.`,
      '  }',
      `  Place ${t}_u_adit "the quarry adit" is room within ${t} at 2, 3 underground.`,
      `  Passage ${t}_u_adit_mouth "the roped adit" is passage between ${t}_u_pit and ${t}_u_adit.`,
      `  Place ${t}_u_gallery "the cut gallery" is room within ${t} at 2, 4 underground.`,
      `  Passage ${t}_u_gallery_way "the old cutting" is passage between ${t}_u_adit and ${t}_u_gallery.`,
      `  Person ${t}_u_spiders "the spiders in the old workings" at ${t}_u_gallery {`,
      '    Role "cave spiders the size of dogs, that have strung the old workings with web". Species cave_spider. Numbers 2. Level 1. Lair ' + `${t}_u_gallery.`,
      '  }',
      ...[`${t}_u_cellar`, `${t}_u_warren`, `${t}_u_crypt`, `${t}_u_ossuary`, `${t}_u_adit`, `${t}_u_gallery`]
        .map(r => `  Initially Assert unlit(${r}).`),
    ];
  }
  // Where the three meet: an old drain from the rat-runs, and the undercroft the ossuary and the gallery both open on.
  private static below(t: string): string[] {
    const q = this.q;
    return [
      `  Place ${t}_u_drain "the old drain" is room within ${t} at 0, 5 underground.`,
      `  Passage ${t}_u_drain_way "a culvert going down" is crawl between ${t}_u_warren and ${t}_u_drain.`,
      `  Place ${t}_u_undercroft "the undercroft" is room within ${t} at 1, 5 underground.`,
      `  Passage ${t}_u_drain_mouth "the mouth of the drain" is passage between ${t}_u_drain and ${t}_u_undercroft.`,
      `  Passage ${t}_u_ossuary_steps "steps down behind the bone-heaps" is steps between ${t}_u_ossuary and ${t}_u_undercroft.`,
      `  Passage ${t}_u_gallery_breach "a breach in the gallery floor" is crawl between ${t}_u_gallery and ${t}_u_undercroft.`,
      `  Initially Assert unlit(${t}_u_drain). Initially Assert unlit(${t}_u_undercroft).`,
      `  Observe ${t}_u_undercroft_scene at ${t}_u_undercroft as fixture when true ${q('A long room of round pillars, older than anything above it: the corn-store, the church and the quarry were all dug down into it, from three sides, by people who did not know it was here. The floor is flagged, and one flag in the middle is cut with a ring of letters nobody here can read.')}.`,
      `  Person ${t}_u_crawler "a great centipede" at ${t}_u_drain {`,
      '    Role "a centipede as long as a man, living in the old drain". Species great_centipede. Numbers 1. Level 2. Lair ' + `${t}_u_drain.`,
      '  }',
      `  Discovery ${t}_u_drain_cache_found ${q('Wedged in the drain where the water would have carried it, a purse someone dropped down a grating long ago.')} {`,
      `    Found by searching ${t}_u_drain ${q('Something wedged in the drain, where the water left it.')}.`, '  }',
      `  Item ${t}_u_drain_purse "a mouldy purse" is steel_coin at ${t}_u_drain hidden until ${t}_u_drain_cache_found.`,
    ];
  }
  // Under the lettered flag, found by searching the undercroft: the vault, what keeps it, and what it keeps.
  private static vault(t: string): string[] {
    const q = this.q;
    return [
      `  Discovery ${t}_u_vault_found ${q('The lettered flag in the undercroft floor lifts: under it, a stair going down into the dark.')} {`,
      `    Found by searching ${t}_u_undercroft ${q('The flag cut with letters is not set like the others: it rocks under your foot.')}.`, '  }',
      `  Place ${t}_u_vault "the sealed vault" is room within ${t} at 1, 6 underground.`,
      `  Passage ${t}_u_vault_stair "the stair under the lettered flag" is stair between ${t}_u_undercroft and ${t}_u_vault hidden until ${t}_u_vault_found.`,
      `  Initially Assert unlit(${t}_u_vault).`,
      `  Person ${t}_u_keeper "the keeper of the vault" at ${t}_u_vault {`,
      '    Role "the last of whoever built the undercroft, long dead and still at its post". Species ghoul. Numbers 1. Level 3. Lair ' + `${t}_u_vault.`,
      `    Warns ${q('Something stands up from a stone chair at the far end of the vault, slowly, as if it had been waiting a long time.')}.`,
      '  }',
      `  Item ${t}_u_vault_rings "a cord of old rings" is grave_rings at ${t}_u_vault.`,
      `  Item ${t}_u_vault_stone "a moonstone the size of a thumb" is moonstone at ${t}_u_vault.`,
      `  Objective ${t}_u_vault_sought when knows(party, ${t}_u_vault_found) and able(${t}_u_keeper) "Something keeps the sealed vault under the undercroft.".`,
    ];
  }
  // Who in the town will pay to be rid of each trouble, what they say, and the thanks.
  private static errands(region: Region, s: Settlement): string[] {
    const t = s.id, q = this.q, town = s.name;
    const jobs: [string, string, string, string, string, number][] = [
      ['rats', 'merchant', 'the rats in the corn-store', `'They've got into the old corn-store from underneath,' says {${t}_merchant}. 'Rats the size of cats. I've lost a third of the grain. Ten coin to whoever clears them out: there's a trapdoor in the floor.'`, `Clear the rats out from under the old corn-store at ${town}; {${t}_merchant} will pay ten coin.`, 10],
      ['dead', 'priest', 'the noises under the churchyard', `{${t}_priest} looks at the floor. 'The catacombs. Something has come up out of the bone-heaps, and the old stair is the only way down. I cannot ask anyone to go. I will give fifteen coin to anyone who does.'`, `Lay whatever has come up in the catacombs under the churchyard at ${town}; {${t}_priest} will give fifteen coin.`, 15],
      ['spiders', 'innkeeper', 'the old quarry', `'Nobody goes in the old quarry now,' says {${t}_innkeeper}. 'There's webs across the adit thick as sailcloth, and the Hobb boy went in after a ferret and came out white. Twelve coin from the house to whoever burns them out.'`, `Burn the spiders out of the old quarry's workings at ${town}; {${t}_innkeeper} will pay twelve coin.`, 12],
    ];
    // What the green talks of, while any of it is still to do: where to ask (a company come to town had been shown
    // nothing to do but a road out of it).
    const open = jobs.map(([who]) => `able(${t}_u_${who})`).join(' or ');
    const talk = `Talk on the green is of what is under the town: rats in the old corn-store (ask {${t}_merchant}), something come up in the catacombs (ask {${t}_priest}), and webs across the old quarry's adit (ask {${t}_innkeeper}). Nobody has gone down.`;
    return [`  Observe ${t}_u_under_talk at ${t}_green as ambience when ${open} ${q(talk)}.`,
      ...jobs.flatMap(([who, giver, topic, says, aim, coin]) => {
      const fact = `${t}_u_${who}_job`, g = `${t}_${giver}`;
      return [`  Entity ${fact}: fact ${q(aim.replace(/; .*$/, '.'))}.`,
        `  Topic ${fact}_ask with ${g} ${q(`Ask {${g}} about ${topic}`)} when able(${t}_u_${who}) once {`,
        `    Says ${q(says)}.`, `    On discuss { Assert knows(actor, ${fact}). }`, '  }',
        `  Objective ${fact}_aim when knows(party, ${fact}) and able(${t}_u_${who}) ${q(aim)}.`,
        `  Topic ${fact}_paid with ${g} ${q(`Tell {${g}} it is done`)} when knows(actor, ${fact}) and not able(${t}_u_${who}) once {`,
        `    Says ${q(`{${g}} counts out ${coin} coin into your hand. 'I did not think anyone would. Thank you.'`)}.`,
        `    On discuss { Increase quantity(actor, gold) by ${coin}. }`, '  }'];
      })];
  }
}
