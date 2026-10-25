import type { DeepLayout } from './deep-layout';

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
    elite: 'From {room} comes a sound you do not like at all: something large, that is not in any hurry.',
    // One of the worst who is someone, not something (a robbers' captain): heard as a man or a woman is.
    leader: 'From {room} comes the scrape of a whetstone on steel, slow and even: whoever is in there is in no hurry.' };
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
    const next = [...new Set(ways.map(l => l.a === room ? l.b : l.a))];
    const by = !elite && temperament === 'ambush' ? ' as sign noticed by woodcraft' : '';
    // What falls on whoever comes in, or is one of the worst, can be drawn out to be met (inhabitants.kyr).
    const drawn = said && (elite || temperament === 'savage') ? [`  Initially Assert drawable(${id}).`] : [];
    return [...drawn, ...said ? next.map(n => `  Observe ${id}_heard_${room}_${n} at ${n}${by} when able(${id})`
      + ` and at(${id}, ${room}) ${this.q(said.replace('{room}', `{${room}}`))}.`) : [],
    ...this.carried(layout, band, this.far[worst ?? (person ? 'person' : this.far[kindly] ? kindly : temperament)])];
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
