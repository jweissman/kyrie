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
  // Whether a band of this temperament (or one of the worst) is heard at all.
  static told(temperament: string, elite = false): boolean { return elite || !!this.sounds[temperament]; }
  // The band heard in a room, from each room a way leads from it.
  static lines(layout: DeepLayout, band: { id: string; room: string; temperament: string; elite?: boolean;
    person?: boolean; kind?: string }): string[] {
    const { id, room, temperament, elite } = band, kindly = `${temperament}:${band.kind ?? ''}`;
    if (!this.told(temperament, elite)) { return []; }
    const said = this.sounds[elite ? band.person ? 'leader' : 'elite' : this.sounds[kindly] ? kindly : temperament]!, ways = layout.links.filter(l => [l.a, l.b].includes(room));
    const next = [...new Set(ways.map(l => l.a === room ? l.b : l.a))];
    const by = !elite && temperament === 'ambush' ? ' as sign noticed by woodcraft' : '';
    return next.map(n => `  Observe ${id}_heard_${room}_${n} at ${n}${by} when able(${id}) and at(${id}, ${room})`
      + ` ${this.q(said.replace('{room}', `{${room}}`))}.`);
  }
}
