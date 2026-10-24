import type { DeepLayout } from './deep-layout';

// Who can be heard from the next room before they are met, while they are there and able: a band that falls on
// whoever comes in, or keeps its ground, or one of the deep's worst. Told in every room a way leads from. What lies
// in wait makes no sound, and only someone who reads sign sees that it is there.
export class DeepSounds {
  static readonly q = JSON.stringify;
  static readonly sounds: Record<string, string> = {
    savage: 'From {room} comes a sound that stops when you stop: breathing, or something like it.',
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
    person?: boolean }): string[] {
    const { id, room, temperament, elite } = band;
    if (!this.told(temperament, elite)) { return []; }
    const said = this.sounds[elite ? band.person ? 'leader' : 'elite' : temperament]!, ways = layout.links.filter(l => [l.a, l.b].includes(room));
    const next = [...new Set(ways.map(l => l.a === room ? l.b : l.a))];
    const by = !elite && temperament === 'ambush' ? ' as sign noticed by woodcraft' : '';
    return next.map(n => `  Observe ${id}_heard_${room}_${n} at ${n}${by} when able(${id}) and at(${id}, ${room})`
      + ` ${this.q(said.replace('{room}', `{${room}}`))}.`);
  }
}
