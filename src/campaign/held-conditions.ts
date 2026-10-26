import type { CreatureStore } from '../creature-store';
import type { ConditionInstance } from '../creature';

// Until fights let go of what they were fought under (Battle.held), a fight wrote a company's weariness and readiness
// onto whoever fought it, for good: they fought weary after a night's sleep, needed care for nothing, and the next
// weary fight failed with "Invalid creature conditions". A game kept so lets them go as it is opened, as they should
// have gone when the fight did. Nothing else puts either on a creature: Environment brings them to a fight from the
// world (a weary company; one that waited for what it fights).
export class HeldConditions {
  static readonly ids = ['weary', 'ready'];
  // Whether any were let go.
  static release(store: CreatureStore): boolean {
    const stale = store.live.filter(c => c.state.conditions.some(s => this.left(s))).map(c => c.id);
    if (!stale.length) { return false; }
    const lease = store.acquire(stale);
    try {
      lease.creatures.forEach(c => { c.state.conditions = c.state.conditions.filter(s => !this.left(s)); });
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    return true;
  }
  private static left(s: ConditionInstance): boolean {
    return this.ids.includes(s.id) && !s.source && s.clock === 'until-removed';
  }
}
