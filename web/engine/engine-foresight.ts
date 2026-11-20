import { Creation } from './creation';
import type { EngineCreation } from './engine-creation';
import type { EngineStarts } from './engine-starts';
import type { Setting } from '../../src/creation/protocol';

// The country a new game will begin in, drawn before it is asked for (the owner, 19 November, OR-121: "the default
// world and a starting character prepared or restored before the title appears; the title immediate"). The page names
// the seed it will use as the title shows (ReaderOpening.foresee); the country is drawn for it, the life Set out now
// would draw is rolled (EngineCreation.rolled), and that start made ready behind it (EngineStarts.foresee). Asked for
// then by the same seed, the country is the one drawn, never drawn again; Set out now takes the start made ready. A
// country drawn and not taken is let go when another is drawn or a kept game is opened. The worker answers between
// the parts of the drawing, so nothing on the title waits on it.
export class EngineForesight {
  // foreseen: whether the start Set out now asks has been made ready for it (see foreseen).
  private drawing?: { seed: string; terrain?: string; setting: Promise<Setting>; foreseen?: boolean };
  constructor(private readonly creation: Creation, private readonly made: EngineCreation,
    private readonly starts: EngineStarts) {}
  // A country drawn for a life to be made for, and its texts read while the player reads the first page: the one drawn
  // ahead for the same seed, where there is one, its start made ready kept for Set out now until a choice is made (a
  // life made otherwise gives it up at its first choice: EngineStarts.readying). A country asked for again before an
  // earlier asking has been drawn begins no life: the later one is made.
  async drawn(seed: string, terrain?: string): Promise<Setting> {
    const kept = this.drawing?.seed === seed && this.drawing.terrain === terrain ? this.drawing : undefined;
    if (!kept) { this.starts.drop(); }
    const drawing = kept ?? this.draw(seed, terrain), setting = await drawing.setting;
    if (this.drawing !== drawing) { return setting; }
    this.made.begun(setting, EngineForesight.at(seed, terrain));
    if (!drawing.foreseen) { this.starts.readying(this.made.starting(), 'read'); }
    return setting;
  }
  // The country for the seed a new game will use, and the start Set out now would ask, made ready meanwhile.
  ahead(seed: string): void {
    if (this.drawing?.seed === seed && !this.drawing.terrain) { return; }
    this.starts.drop();
    const drawing = this.draw(seed);
    void drawing.setting.then(this.foreseen.bind(this, drawing)).catch(() => undefined);
  }
  // The country under way drawn, and the start it asks begun (see EngineHost.idle).
  async settled(): Promise<void> { await this.drawing?.setting.catch(() => undefined); }
  // Nothing drawn ahead is kept any longer: a kept game is being opened.
  drop(): void { this.drawing = undefined; this.starts.drop(); }
  private foreseen(drawing: NonNullable<EngineForesight['drawing']>, setting: Setting) {
    if (this.drawing !== drawing) { return; }
    this.made.begun(setting, EngineForesight.at(drawing.seed));
    this.starts.foresee(this.made.rolled());
    drawing.foreseen = true;
  }
  private draw(seed: string, terrain?: string): NonNullable<EngineForesight['drawing']> {
    const drawing: NonNullable<EngineForesight['drawing']> = { seed, ...terrain ? { terrain } : {},
      setting: this.creation.generate(seed, terrain) };
    // A drawing that fails is not kept: asked again, it is drawn again, and says why.
    drawing.setting.catch(this.failed.bind(this, drawing));
    this.drawing = drawing;
    return drawing;
  }
  private failed(drawing: EngineForesight['drawing']) { if (this.drawing === drawing) { this.drawing = undefined; } }
  private static at(seed: string, terrain?: string) {
    return { campaign: Creation.generated, seed, ...terrain ? { terrain } : {} };
  }
}
