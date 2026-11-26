import type { Campaign } from '../../src/campaign/campaign';
import { Itineraries } from '../../src/ui/itinerary';
import { ScreenModel } from '../../src/ui/screen-model';
import type { Screen } from '../../src/ui/screen-types';

// The screen as the map has it: charted, the map's journeys laid (Itineraries.charted), where an ordinary turn's lays
// only the aim's (routes on demand, OR-633). For a spec that reads the map's journeys, as the page's map does.
export class Charted {
  static screen(c: Campaign): Screen { return Itineraries.charted(c, ScreenModel.build(c)); }
}
