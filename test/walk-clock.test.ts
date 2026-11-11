import { describe, expect, it } from 'bun:test';
import { Walking } from './support/walking';

describe('the Walk of the Milestones: its clock runs without the company', () => {
  it('does nothing and a riot follows, and every town shows it', async () => {
    const { j, placed } = await Walking.world('a1');
    const f = Walking.flash(j), seen: string[] = [];
    await j.play('=day 2 12:00');
    seen.push(`d2 a=${Walking.measure(j, 'host', 'walk_a')} chalk=${Walking.state(j, 'chalk_a')} wenna=${Walking.at(j, 'wenna')}`);
    await j.play('=day 5 12:00');
    seen.push(`d5 a=${Walking.measure(j, 'host', 'walk_a')} b=${Walking.measure(j, 'host', 'walk_b')} dray=${Walking.at(j, 'dray')} leader=${Walking.at(j, 'leader')} notice_b=${Walking.state(j, 'notice_b')}`);
    await j.play('=day 9 12:00');
    seen.push(`d9 flash=${f} leader=${Walking.at(j, 'leader')} dray=${Walking.at(j, 'dray')} hask=${Walking.at(j, 'hask')} gaunt=${Walking.at(j, 'gaunt')} strife=${Walking.measure(j, 'strife', 'walk')}`);
    await j.play('=day 11 10:00');
    seen.push(`d11 strife=${Walking.measure(j, 'strife', 'walk')} ending=${Walking.drawn(j, 'ending')} chalk=${['a','b','c','d'].map(x => Walking.state(j, `chalk_${x}`))} notice=${['a','b','c','d'].map(x => Walking.state(j, `notice_${x}`))} chair=${Walking.state(j, 'bench_chair')} door=${Walking.state(j, `station_door_${f}`)}`);
    console.log(placed.bindings, seen.join('\n'));
    expect(Walking.drawn(j, 'ending')).toEqual(['e_riot']);
  }, 600000);
});
