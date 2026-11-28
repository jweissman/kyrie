import { ModuleWriter, type Change, type Module, type World } from '../lang/index';

// Surveys are records of actual finds, not a second quest interpreter. New installations extend the same
// knowledge, route and objective contracts as authored adventures; no stock of prewritten quests is consumed.
export class VenturingSurveys {
  static add(module: Module, world: World): World {
    if (!world.relates('guildSurvey')) { return world; }
    const areas = [...new Set(world.related('guildRange').map(range => range.args[1]!))];
    if (!areas.length) { return world; }
    const entities = new Map(module.entities.map(entity => [entity.id, entity]));
    const changes: Change[] = [];
    const surveyed = new Set(world.related('guildSurvey').map(survey => survey.args[1]!));
    const objectives = new Set(module.objectives?.map(objective => objective.id));
    const locations = [...world.related('at'), ...world.related('inside').flatMap(call => {
      const place = world.one('at', call.args[1]!);
      return place ? [ModuleWriter.call('at', call.args[0]!, place)] : [];
    })];
    for (const location of locations) {
      const id = location.args[0]!, place = location.args[1]!;
      const item = entities.get(id), destination = entities.get(place);
      if (item?.type !== 'item' || !destination?.space || surveyed.has(id)
        || !world.test(ModuleWriter.call('guildFind', id))
        || !areas.some(area => world.test(ModuleWriter.call('within', place, area)))
        || world.test(ModuleWriter.call('forSale', id)) || world.test(ModuleWriter.call('recovered', id))) { continue; }
      const report = `${id}__guild_survey`;
      if (entities.has(report) || objectives.has(report)) {
        throw new Error(`Guild survey identity already declared: ${report}`);
      }
      surveyed.add(id);
      module.entities.push({ id: report, type: 'fact', name: `${item.name} was surveyed at ${destination.name}.` });
      changes.push(...['established', 'leadsTo', 'guildSurvey'].map(name => ({
        kind: 'assert' as const, call: ModuleWriter.call(name, report,
          ...name === 'established' ? [] : name === 'leadsTo' ? [place] : [id, place]),
      })));
      (module.objectives ??= []).push({ id: report, text: `Find {${id}} at {${place}}.`, toward: [id, place],
        when: { kind: 'and', left: ModuleWriter.call('guildIssued', 'party', id), right: {
          kind: 'and', left: { kind: 'not', value: ModuleWriter.call('recovered', id) },
          right: { kind: 'not', value: ModuleWriter.call('stale', report) },
        } } });
    }
    module.initial.push(...changes);
    return world.apply(changes);
  }
}
