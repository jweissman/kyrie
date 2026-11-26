export class CampaignCopies {
  static arrays<T extends object>(object: T): T {
    return Object.fromEntries(Object.entries(object).map(([key, value]) =>
      [key, Array.isArray(value) ? [...value as unknown[]] : value])) as T;
  }
}
