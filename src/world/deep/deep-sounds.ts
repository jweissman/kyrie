import type { DeepLayout } from './deep-layout';
import { DeepMechanisms } from './deep-mechanisms';

// Who can be heard from the next room before they are met, while they are there and able: a band that falls on
// whoever comes in, or keeps its ground, or one of the deep's worst. Told in every room a way leads from. What lies
// in wait makes no sound, and only someone who reads sign sees that it is there.
export class DeepSounds {
  static readonly q = JSON.stringify;
  static readonly sounds: Record<string, string> = {
    savage: 'From {room} comes a sound that stops when you stop: breathing, or something like it.',
    // Of what falls on whoever comes in, what kind of thing it is can be told from the sound of it (the follow-up
    // review met a banshee as a fight the moment its room was entered, with breathing for its warning).
    'savage:undead': 'From {room} comes a cold you can feel on your face, and a sound like a breath let out, and out, '
      + 'and never drawn in.',
    'savage:elemental': 'Something in {room} moves as weather moves, and stops when you stop; the air that comes out '
      + 'of it is wrong.',
    'savage:aberration': 'From {room} comes a wet sound, slow and patient, that stops when you stop.',
    'savage:construct': 'From {room} comes a sound like stone grinding on stone, once, and then nothing.',
    territorial: 'Something is moving about in {room}, and goes still when you do.',
    ambush: 'The stone at the mouth of the way to {room} is slick, and there is a sweetish smell from it, like '
      + 'something left too long. Something lies in wait in there.',
    // What anyone sees at the mouth of a way to where something lies in wait, read for what it is or not: a lone
    // first-level thief had walked into the barrow's ossuary spiders unwarned (PL-07, decision 4: every lethal band is
    // told before it is engaged; placements.md). The surprise is kept: it still springs.
    'ambush:seen': 'The way to {room} is quieter than the rest, the quiet of something holding its breath, and the '
      + 'dust at its mouth is scuffed and swept as if something had lain there.',
    elite: 'From {room} comes a sound you do not like at all: something large, that is not in any hurry.',
    // One of the worst who is someone, not something (a robbers' captain): heard as a man or a woman is.
    leader: 'From {room} comes the scrape of a whetstone on steel, slow and even: whoever is in there is in no hurry.' };
  // What a band that falls on whoever comes in, or one of the deep's worst, leaves on the ways to it, by what it is: a
  // second sign of its own kind beside its sound, seen by a light (OR-1854: the owner's ruling of 27 November, that an
  // unwarned fight is only very occasionally lethal and the place forebodes it; the barrow's forecourt dead had come
  // at a company whose way in had said only that it heard a sound).
  static readonly spoor: Record<string, string> = {
    undead: 'The dust on the way to {room} is marked by feet that drag, and none of the marks come back.',
    beast: 'Gnawed bones lie on the way to {room}, and the air there has the rank smell of a lair.',
    person: 'Fresh boot-marks go in and out of {room}, many of them.',
    aberration: 'A trail of slime, dried to a shine, goes in at the way to {room}.',
    construct: 'The floor at the way to {room} is scored with long, fresh scrapes.',
    elemental: 'The stone at the way to {room} is cracked and stained, as if by great heat or cold.',
    any: 'Bones lie scattered at the way to {room}, picked clean.' };
  // What a band sounds like from far off, carried through the stone to a listening-room: anything that is about its
  // business there is heard, the wary too; what lies in wait is not.
  static readonly far: Record<string, string> = { savage: 'something breathing',
    'savage:undead': 'a breath let out, and out, and never drawn in', 'savage:elemental': 'a sound like wind where no '
      + 'wind could be', 'savage:aberration': 'a wet sound, slow and patient', 'savage:construct': 'stone grinding on '
      + 'stone', territorial: 'something moving about', wary: 'something that moves softly, and stops to listen',
    person: 'voices, too low to make out', elite: 'something large, in no hurry',
    leader: 'a whetstone going on steel, slow and even' };
  // The band heard in a room, from each room a way leads from it, and from wherever its level's sounds are carried.
  static lines(layout: DeepLayout, band: Band): string[] {
    const { id, room, temperament, elite, person } = band, kindly = `${temperament}:${band.kind ?? ''}`;
    const worst = elite ? person ? 'leader' : 'elite' : undefined;
    const said = this.sounds[worst ?? (this.sounds[kindly] ? kindly : temperament)];
    const ways = layout.links.filter(l => [l.a, l.b].includes(room));
    const next = [...new Set([...ways.map(l => l.a === room ? l.b : l.a), ...this.outside(layout, room)])];
    const by = !elite && temperament === 'ambush' ? ' as sign noticed by woodcraft' : '';
    // What falls on whoever comes in, or is one of the worst, can be drawn out to be met (inhabitants.kyr).
    const drawn = said && (elite || temperament === 'savage') ? [`  Initially Assert drawable(${id}).`] : [];
    // What lies in wait shows at the mouth of each way to it (the seen sign below): a fact the page can read (OR-12).
    const lurks = by ? [`  Initially Assert lurks(${id}, ${room}).`] : [];
    const seen = by ? this.sounds['ambush:seen']! : undefined;
    // What is heard is a sound, told in the dark as well as the light (LocalObservations); a sign is seen, and only by
    // a light (a lethal band had been heard only by a company carrying a torch: the register's GT-05).
    return [...drawn, ...lurks, ...said ? next.map(n => `  Observe ${id}_heard_${room}_${n} at ${n}${by || ' as sound'} when able(${id})`
      + ` and at(${id}, ${room}) ${this.q(said.replace('{room}', `{${room}}`))}.`) : [],
    ...seen ? next.map(n => `  Observe ${id}_seen_${room}_${n} at ${n} when able(${id}) and at(${id}, ${room})`
      + ` ${this.q(seen.replace('{room}', `{${room}}`))}.`) : [],
    ...drawn.length ? this.tracks(band, next) : [],
    ...this.carried(layout, band, this.far[worst ?? (person ? 'person' : this.far[kindly] ? kindly : temperament)])];
  }
  // The way in outside a room, where it has one: the first room's (the stair down to the forecourt), and the vent's,
  // whose rungs climb to it (DeepMechanisms): it is heard from there, as from any next room.
  private static outside(layout: DeepLayout, room: string): string[] {
    const mouth = layout.levels[0]?.rooms[0]?.id === room, vent = DeepMechanisms.room(layout, 'vent')?.id === room;
    return mouth || vent ? [layout.site] : [];
  }
  // The spoor of a band that falls on whoever comes in, or of one of the worst, at each way to it, by its kind.
  private static tracks(band: Band, next: string[]): string[] {
    const { id, room } = band, kind = band.person ? 'person' : this.spoor[band.kind ?? ''] ? band.kind! : 'any';
    const text = this.q(this.spoor[kind]!.replace('{room}', `{${room}}`));
    return next.map(n => `  Observe ${id}_spoor_${room}_${n} at ${n} when able(${id}) and at(${id}, ${room}) ${text}.`);
  }
  // A thing that carries the sound of its level (a listening-room's bowl) can be listened at; once it has been, what
  // is about its business on that level is heard in it, small and near, while it is there.
  static listening(layout: DeepLayout): string[] {
    return layout.levels.flatMap(l => l.rooms).flatMap(r => r.hears ? [
      `  Thing ${r.id}_hears ${this.q(r.hears.thing)} at ${r.id} { Tries listening. }`,
      `  Observe ${r.id}_hears_all at ${r.id} when tried(${r.id}_hears, listening) ${this.q(r.hears.heard)}.`] : []);
  }
  private static carried(layout: DeepLayout, band: Band, sound?: string): string[] {
    const level = layout.levels.find(l => l.rooms.some(r => r.id === band.room));
    return sound ? (level?.rooms ?? []).filter(r => r.hears && r.id !== band.room).map(r => `  Observe `
      + `${band.id}_carried_${band.room}_${r.id} at ${r.id} when tried(${r.id}_hears, listening) and able(${band.id})`
      + ` and at(${band.id}, ${band.room}) ${this.q(r.hears!.carried.replace('{sound}', sound)
        .replace('{room}', `{${band.room}}`))}.`) : [];
  }
}
interface Band { id: string; room: string; temperament: string; elite?: boolean; person?: boolean; kind?: string }
