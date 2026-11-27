import { PresentationResources } from '../ports/presentation-resources';
import { CompanyPortraits } from './company-portraits';
import { CreaturePortraits } from './creature-portraits';
import { ItemPlates } from './item-plates';
import { Likeness } from './likeness';
import { Sittings } from './sittings';

class InstalledPresentation {
  static readonly ids = Likeness.ids;
  static src(id: string): string { return Likeness.src(id); }
  static portrait(id: string) { return Likeness.portrait(id); }
  static said(...args: Parameters<typeof CompanyPortraits.said>) { return CompanyPortraits.said(...args); }
  static member(...args: Parameters<typeof CompanyPortraits.member>) { return CompanyPortraits.member(...args); }
  static face(...args: Parameters<typeof CreaturePortraits.face>) { return CreaturePortraits.face(...args); }
  static creature(...args: Parameters<typeof CreaturePortraits.of>) { return CreaturePortraits.of(...args); }
  static painted(...args: Parameters<typeof Sittings.painted>) { return Sittings.painted(...args); }
  static sitting(...args: Parameters<typeof Sittings.of>) { return Sittings.of(...args); }
  static item(...args: Parameters<typeof ItemPlates.of>) { return ItemPlates.of(...args); }
  static kind(...args: Parameters<typeof ItemPlates.kind>) { return ItemPlates.kind(...args); }
}

// The painting side of the installed Westernesse presentation. This module lives with the providers so the setting's
// canon installer does not gain an import cycle through them.
PresentationResources.provide({
  likeness: { ids: InstalledPresentation.ids, src: InstalledPresentation.src,
    portrait: InstalledPresentation.portrait },
  companyPortraits: { said: InstalledPresentation.said, member: InstalledPresentation.member },
  creaturePortraits: { face: InstalledPresentation.face, of: InstalledPresentation.creature },
  sittings: { painted: InstalledPresentation.painted, of: InstalledPresentation.sitting },
  itemPlates: { of: InstalledPresentation.item, kind: InstalledPresentation.kind },
});
