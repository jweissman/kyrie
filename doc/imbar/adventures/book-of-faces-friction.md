# Book of Faces: friction

1. **The standalone campaign is a company of one.** `company.kyr` says `of 1`, so calling-keyed voices cannot fire in `data/campaigns/the-book-of-faces.campaign.json`. They do in a generated world (the company is the world's). Worked round with a test-only fixture module (`test/fixtures/book-of-faces/`, company of four). Smallest repair: none needed for the world; a campaign `party` override is blocked because the module fixes the size.
2. **`befell(...)` needs `"canon": [...]` in `module.json`**, else lint: *Invalid argument rose_made_whole*. Fixed by listing it.
3. **Journey `holds` auto-prefixes the module**: `holds('rv_x','party')` passes where a negation I meant to fail also passed. Cost: one bad assertion. Repair: none, noticed in test.
4. **A level-3 construct dies to one hit**, and a won fight pays 542 experience each, so the fight beat the ways round. Raised to level 6, made costly by consequence (Bursar, chit, vigil). Smallest repair: an experience cap for sub-par foes (data only: not done).
5. **A stash by a stray command** nearly lost shared work; shared tree is edited by other authors at once. Not repeated.
6. Slate check at Thole is a coin flip: tests use seed `b`.
