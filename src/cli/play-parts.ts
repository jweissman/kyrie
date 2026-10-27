// `kyrie play scene <id> --in <adventure>` and `kyrie play character <id> --in <adventure>`: the adventure's campaign
// played to one of its scenes, or to someone of it and into talk with them, in a context its author has named (the
// steps under that name in data/adventures/<adventure>/contexts.json, played first: "after the flood"); and then the
// steps given, as `kyrie play` plays them.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Journey } from '../session/journey';
import { ActionSchemas } from '../campaign/action-schemas';

export class PlayParts {
  static async start(kind: string, id: string, adventure: string, context?: string):
    Promise<{ journey: Journey; lead: string[] }> {
    const campaign = `data/campaigns/${adventure}.campaign.json`, file = `data/adventures/${adventure}/contexts.json`;
    const read = JSON.parse(await readFile(campaign, 'utf8')) as { modules: { id: string; bundle: string }[] };
    // Its things are named by the id the campaign installs it as (Calamy's adventure is in parliament-of-books).
    const as = read.modules.find(m => m.bundle.includes(`adventures/${adventure}/`))?.id ?? adventure;
    const contexts = existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) as Record<string, string[]> : {};
    if (context && !contexts[context]) {
      throw new Error(`No context "${context}" in ${file}: ${Object.keys(contexts).join(', ') || 'none is named there'}`);
    }
    const journey = await Journey.start(campaign, context ?? kind);
    // Someone is called as the page calls them: by their name, not what they do ("Mara", not "Mara, a fisher").
    const name = ActionSchemas.labels(journey.campaign.module).get(`${as}__${id}`);
    if (!name) { throw new Error(`Nothing in ${adventure} is called ${id} (${as}__${id})`); }
    const talk = kind === 'character' ? [`^Talk to ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`] : [];
    return { journey, lead: [...context ? contexts[context]! : [], `>${as}__${id}`, ...talk] };
  }
}
