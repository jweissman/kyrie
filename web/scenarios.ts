import bundled from './bundles.generated.json';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';

export interface ScenarioEntry {
  manifest: string; title: string; seed: string; note: string; detail: string; recommended?: boolean;
}
// Build-time snapshot of the authored files; keys are the same repo-relative paths the CLI reads.
export class Scenarios {
  static readonly files: Record<string, string> = bundled;
  // The authored campaigns the game offers. The old corpus (the Serewater March, the Varrow and the rest) was
  // retired in Mission 8; what of it the tests still use lives in test/fixtures/march.
  static readonly list: ScenarioEntry[] = [
    { manifest: 'data/campaigns/the-long-man.campaign.json', title: 'The Long Man', seed: 'merrow',
      note: 'A long straight ridge lies across the head of Merrowdale, and the village under it says a giant king is buried there. Something tall walks its crest at night, and the steward has posted forty crowns to have it laid.',
      detail: 'A dale, a wall, a lake and three days before the storm', recommended: true },
    // An independent adventure, played as it was written (doc/adventures/thrume).
    { manifest: 'data/campaigns/thrume.campaign.json', title: 'Thrume', seed: 'saltgrave',
      note: 'In the salt town under the fells, people pay to sleep, and some of them do not come home. The giants of Thrume have come down off the mountain for the first time in living memory, and the Margravine of Ebb will pay a barony for the thane\'s head.',
      detail: 'A salt town, a giants\' hold, a mountain that is a body, and ten days before the host of Harle crosses the Ebb' },
    { manifest: 'data/campaigns/the-house-that-grows.campaign.json', title: 'The House That Grows', seed: 'noon',
      note: 'You are in your second year learning the Watch, and Kezu of Cobble Ring is your teacher. Two nights ago she sat up with a room of glass that fell into Haddo\'s barley, and at dawn she shut her eyes on purpose and let its small door open.',
      detail: 'A crater-ring town, a room of glass that grows where nobody watches it, and the city overhead' },
    { manifest: 'data/campaigns/let-one-remember.campaign.json', title: 'The Road the Star Came Down', seed: 'corrow',
      note: 'Ninety years after the star at the bottom of the Well got up and left, the floating mountain the Corrow calls Hightown drifts toward the lake it was lifted out of; a forgotten name is gathering itself in the grey; and a new star is brightening over the Teskarn.',
      detail: 'Five acts: the Corrow, the grey country, the war of the kin, the voyage, and the end of the road' },
    { manifest: 'data/campaigns/the-patient-star.campaign.json', title: 'The Patient Star', seed: 'quell',
      note: 'Two thousand years ago a seed fell on the Ghessil Uplands and did not go out. Its light stops time in stone and slows it in flesh. You are a cutter of Quell, in debt; your uncle has stood eleven months in an open granary vault under the glass, alive.',
      detail: 'A plateau under a light that slows, a citadel building itself downward, and the past kept as a place' },
    // An independent adventure, written before its author read the engine (doc/adventures/low-water).
    { manifest: 'data/campaigns/low-water.campaign.json', title: 'Low Water', seed: 'ammerlin',
      note: 'Ammerlin goes down the inside of an old crater in four terraces, and its life is the water of the Stair. For three years the Mere at the bottom has been falling. The Office of Measures has engaged you as Independent Assessor, because nobody who lives in the Bowl can be neutral about water.',
      detail: 'A city of locks and ledgers, a hymn that is an order, a machine under the lake, and six days to the Hearing' },
    // An independent adventure, played as it was written (doc/adventures/what-tessary-owes).
    { manifest: 'data/campaigns/what-tessary-owes.campaign.json', title: 'What Tessary Owes', seed: 'ossel',
      note: 'The legions of Tessary have come home from eleven years\' war, and some of them are getting up in the night and walking into the sea. An eel-wife of the Withies offers her savings to whoever can tell her where her son went.',
      detail: 'A tidal city of salt and paper, the drowned city under it, the keepers of an old engine, and a fortnight until the Feast of Settlement' },
    // An independent adventure: a city of paper, its books waking, and their Parliament
    // (doc/adventures/parliament-of-books).
    { manifest: 'data/campaigns/parliament-of-books.campaign.json', title: 'A Parliament of Books', seed: 'calamy',
      note: 'Calamy stands at the mouth of the Calam, and every household in it keeps a book that knows it. Lately some of its books have begun to talk. In nine days it is the Kindling, when the city burns last year\'s almanacks to light the new year in.',
      detail: 'A city of seven wards, a country made of reading, a Parliament of books, and nine days to the Kindling' },
    // An independent adventure, a comedy, played as it was written (doc/adventures/gosses-company).
    { manifest: 'data/campaigns/gosses-company.campaign.json', title: "Gosse's Company", seed: 'arle',
      note: 'A company of travelling players is stuck on a village green with its wagon chained to a post, on its way west to the Trial of the Wheel at Pentrice: three companies, three nights, a bench of four critics, and a playhouse for ever to the best. The play they will put on came to them out of the air, unsigned, and every word of it is about the man who banned them.',
      detail: 'A licensed city, a playhouse over the river, a week of rehearsals, and one night at the Wheel' },
    // Four cities of one author's, played until Mission 18 only as countries beyond a march (doc/adventures/*).
    { manifest: 'data/campaigns/the-liberty-of-the-ice.campaign.json', title: 'The Liberty of the Ice', seed: 'lisk',
      note: 'The river Lisk has frozen hard under Pellam Bridge for the first time in thirty-one winters, and the city is holding a Frost Fair on it, with a law of its own, cried at noon from a mast with a glove on it: say what you will, keep what you shake on.',
      detail: 'A wool city, a street of booths on the ice, a court for handshakes, and three days before the thaw' },
    { manifest: 'data/campaigns/a-winter-in-carth.campaign.json', title: 'A Winter in Carth', seed: 'g1',
      note: 'The march road brings you up out of the snow-fields to a stone cross where the fell road begins: north over Carth Fell, and down across the white Levels to Gaunt, the walled city of the Minster, three days before the Fast.',
      detail: 'A fell road, a walled city of the Minster, a trial, and three days before the Fast' },
    { manifest: 'data/campaigns/hessel.campaign.json', title: 'The Banns at Hessel', seed: 'h1',
      note: 'Hessel goes up its hill in tiers of steam and honey-coloured stone: the spa where the old come to be mended and the young to be married, in the last four days of its Season. You have a little money, no letters of introduction, and nothing to do there but see it.',
      detail: 'A spa town, its baths and assembly rooms, a marriage in question, and the last four days of the Season' },
    { manifest: 'data/campaigns/the-third-night.campaign.json', title: 'The Third Night', seed: 'wray',
      note: 'Three years you have been on the far side of the fells, hiring out with the droves. Your father went out on the road with the cart and did not come home. Now you are coming down the drove road to Wrayford, the bridge-city on the Wray, a week late.',
      detail: 'A bridge-city on the Wray, a missing father, and three nights' },
    // An independent adventure on a tidal reach (doc/adventures/fair-weather).
    { manifest: 'data/campaigns/skeel.campaign.json', title: 'Fair Weather', seed: 'reach',
      note: 'Skeel lives by wrecks. Three nights ago, in fair weather, a merchantman went onto the sands of the Gannet Reach, and the town has stripped her. At four on the third day the Wreck Court will call her wreck, and she will be Skeel\'s, if nothing living came ashore of her.',
      detail: 'A wrecking town, a sea that goes out twice a day, a dog, a boy, a lantern, and the Wreck Court' },
    // An independent adventure: a town inside a honeycomb, and the week half of it leaves
    // (doc/adventures/half-the-hive).
    { manifest: 'data/campaigns/half-the-hive.campaign.json', title: 'Half the Hive', seed: 'hume',
      note: 'On the Wold of Hume four hundred people live inside a honeycomb under a cliff and belong to bees as big as hounds by the smell of their queen. The old queen is about to swarm, and half the town will walk out behind her and never come back. Their Searchers are short of hands.',
      detail: 'A town in a honeycomb, a high wold of lindens, chalk and heather, four places to live and a week to choose' },
    // An independent adventure over the north march (doc/adventures/the-lull).
    { manifest: 'data/campaigns/the-lull.campaign.json', title: 'The Lull', seed: 'lull',
      note: 'Above the hamlet of Sixways a road goes down from a standing stone, one day in seven, into a valley that has kept only its holy day for fifty-seven years. Whatever is done there without meaning it comes apart at sunset; a night slept there is a week gone outside. The young of Linger mean to work.',
      detail: 'A hamlet that waits, a valley that rests, a mill that works in the dark, and three Lulldays' },
  ];
  static source(): MemoryBundleSource { return new MemoryBundleSource(Scenarios.files); }
}
