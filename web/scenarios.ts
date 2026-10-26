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
    // An independent adventure: a city of paper, its books waking, and their Parliament
    // (doc/adventures/parliament-of-books).
    { manifest: 'data/campaigns/parliament-of-books.campaign.json', title: 'A Parliament of Books', seed: 'calamy',
      note: 'Calamy is a tidal city of paper at the mouth of the Calam, and every household in it keeps a book that knows it. Lately some of its books have begun to talk. In nine days it is the Kindling, when the city burns last year\'s almanacks to light the new year in.',
      detail: 'A city of seven wards, a country made of reading, a Parliament of books, and nine days to the Kindling' },
  ];
  static source(): MemoryBundleSource { return new MemoryBundleSource(Scenarios.files); }
}
