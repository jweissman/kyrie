# Behind the Wainscot: friction

| What I tried | What happened | Cost | Smallest repair |
|---|---|---|---|
| A fate rule that must win over `fate_regiment_rest` | both guard on `not fateTold(f_regiment)`, so **source order decides** | a design constraint | put the layer file before `endings.kyr` in `module.json`; document this in the Kyr guide |
| `befell(rose_made_whole)` in a module with no `canon` event list | would not load | one cycle | add `"canon": ["imbar", "rose_made_whole"]` to both bundles |
| `Give` of a module-local Kind | creates a `_given1` instance; check with `holding(actor, kind)` and global (unprefixed) kind name | a test | the kind name is global: prefix it (`hollins_lady_map_kind`) |
| `Discovery ... { Found by searching place "..." }` | works and teaches only when the player does `Search here` | none | none (used for the notches) |
| Testing "the twelfth notch" fate | needs the Lady alive and `ladyKnows`; reached by `freehold` fixture phases through `answer` | slow (about 10 s each) | none |
| Chart of the northern coast as an outward item | no catalog kind fits; made a local `Kind ... like map` | minor | a shared `chart` kind in the catalog |
| Signposting the quiet minute | An `Observe … as sign when true` at the Skirting is enough. The minute itself is an Observe on the hour, not an action, so there is no unique action to hide. | One Observe. | None. |
