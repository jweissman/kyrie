# Corpus review C: nine adventures

*Branch `adventure/p2-corpus-c`, 11 November 2026. Reviews of `the-dorothea`, `the-grand-tour`, `the-long-man`, `the-lull`, `thrume`, `what-tessary-owes`, `winter-in-carth`, `wrayford` (campaign `the-third-night`) and `wrongboat`, with the changes made in place.*

| Review | Depth of this pass |
|---|---|
| [wrayford](wrayford.md) | deep: greetings, return greetings, five aims, after-news |
| [winter-in-carth](winter-in-carth.md) | deep: all twenty-nine return greetings, first meetings, four aims, after-news |
| [the-long-man](the-long-man.md) | deep: new `merrow.kyr`, greetings, cross-link to the Exchange |
| [what-tessary-owes](what-tessary-owes.md) | medium: twelve first meetings, seventeen return greetings, after-news |
| [the-dorothea](the-dorothea.md) | medium: thirty-three return greetings, two aims, a Quillon cross-link, after-news |
| [thrume](thrume.md) | light: nine speaking people given greetings, after-news |
| [wrongboat](wrongboat.md) | light: fifteen return greetings, one cross-link, after-news |
| [the-lull](the-lull.md), [the-grand-tour](the-grand-tour.md) | light: eight and ten return greetings; the Grand Tour (510 KB) is only sampled |

Proposals for Deem generation or a template that calls Kyr are in [deem-proposals.md](deem-proposals.md); the engine requests that came out of the pass are R47 onward in [../kyr-deem-requests.md](../kyr-deem-requests.md).

## Scope note: the older situations and scenarios

The brief asked also for the older situations and scenarios that are not the three standing modules or the thirteen listed. After removing those, `data/situations/` holds only `arcology`, `bound-howe` and `silent-lord` (the three standing modules, written the same week and reviewed in `modules/`), and `data/scenarios/` holds those three scenarios, the thirteen listed, and the three shared index files (`cities.json`, `library.json`, `standing.json`, of which `standing.json` is shared with other authors). Nothing is left to review, and so nothing was reviewed or changed.

## How the corpus was read, and how far

These are 1.9 MB of Kyr. I could not and did not read all of it. I read the shortest module (the Long Man) in full, read every first meeting and every return greeting in all nine, ran phrase counts over the quoted text of all nine, and read the rules, discoveries and endings of the others by structure. Each review says what it read. Claims about weak prose are claims about the passages I read; the phrase counts are over everything.

## What the nine have in common

Measured over all nine modules (3-, 5- and 6-grams of quoted text):

1. **The look.** "she/he looks at you / looks at the / does not look at" (the five commonest forms) appears about 200 times, in every module; 107 of the `Greets`, `Comes`, `Warns` and `Objects` lines contain a look or a stare. It is the corpus's default first beat, and in the Grand Tour (111) and Wrayford (84) it is a house style. In small doses it is good; where it opens a third of the cast it flattens them.
2. **Return greetings were an afterthought.** Winter in Carth, the Grand Tour and the Lull had them almost everywhere (29/32, 25/29, 21/26) and nearly all were a single gesture under 120 characters. The Dorothea, Wrayford, Tessary, Wrongboat and Thrume had none, and the Long Man one. 113 now exist where there were none, and 47 thin ones are rewritten.
3. **One-shot topics.** `Topic … when true once` is 53 of 83 topics in the Dorothea and 47 of 119 in Tessary: a character is asked once and has nothing more to say. The longer modules gate on `knows` (the Grand Tour 123 of 157), which is the cure, not the symptom.
4. **No aim for the page to lead with.** Wrayford, Winter in Carth, the Dorothea and the Grand Tour had no `Objective`, though the page's gold lead is made from one (`doc/authoring/trail/10-scenes-and-opportunities.md`). Eleven now exist in three of them.
5. **Few signs.** `Observe … as sign` (the page's "knowledge" aspect) appears 40 times in the Grand Tour and a handful in the Long Man, Lull and Dorothea; none in Wrayford, Carth, Tessary, Thrume, Wrongboat.
6. **Danger is rare.** Counting `Temperament` lines: Thrume 11 and the Grand Tour and Wrayford and Wrongboat none. In the three that have none the danger is political, comic or rule-driven; that suits them, and the reviews say where more would be wrong.
7. **Consequences did not leave.** Six of the nine had a rumour in `countries.json` and no `after`: once the company had seen the place through, its country below never said so. Six now do (Wrayford, Thrume, Tessary, Carth, Dorothea, Wrongboat); Merrowdale, the Lull and Sennet had them.

## What was verified, and how

- `bin/kyrie lint data/campaigns/<c>.campaign.json` for the nine campaigns (advice only; no new errors).
- Focused specs: `countries-tool`, `glance-countries`, `the-third-night*`, `the-dorothea`, `dorothea-voices`, `what-tessary-owes*`, `wrongboat*`, `the-long-man*`, `thrume*`, `winter-in-carth*`, `the-lull*`, `the-grand-tour*` (results in the final report).
- Not played: none of this was walked through the page by a player or by the autoplay laboratory. The greetings and aims are checked only to load and to be reachable by the specs.
