# MomTo ancestry-AI reference registry

MomTo uses these public genealogy/agent projects as **reference inputs**, not as copied runtime code. Their interfaces and ideas are evaluated independently and MomTo keeps its private case graph and evidence store separate.

| Project | Git repository | Useful capability to learn from | MomTo adaptation |
|---|---|---|---|
| genealogy-mcp | https://github.com/noahkiss/genealogy-mcp | Provider-neutral genealogy lookup/search/walk concepts | Native genealogy tools and local-graph lookup |
| Open-Genealogy / GRA | https://github.com/DigitalArchivst/Open-Genealogy | Agent-oriented, GPS-aligned research workflow and GEDCOM support | Evidence-led planning, explicit hypotheses, source-aware next searches |
| ancestry-mcp | https://github.com/reeeeemo/ancestry-mcp | GEDCOM/ancestry-file parsing and search | Private GEDCOM import and local relationship graph |
| GedcomMCP | https://github.com/airy10/GedcomMCP | GEDCOM creation/edit/query and relationship analysis | Relationship graph and future GEDCOM validation/export work |
| gedcom-mcp | https://github.com/sjmatta/gedcom-mcp | Structured GEDCOM queries and semantic-search patterns | Fast local graph lookup plus source search |
| gramps-mcp | https://github.com/cabout-me/gramps-mcp | Rich genealogy database tool surface | Provider-neutral tool contracts and extensible source routing |
| FamilySearch GEDCOM | https://github.com/FamilySearch/GEDCOM | GEDCOM standard and validation | Import normalization and future GEDCOM 7 validation |
| Gramps Web | https://github.com/gramps-project/gramps-web | Web genealogy/tree model | Private graph browsing and evidence navigation |
| Gramps Web API | https://github.com/gramps-project/gramps-web-api | Structured genealogy API | Future private graph API adapter |
| webtrees | https://github.com/fisharebest/webtrees | Relationship traversal, search, citations | Relationship-path and citation-aware research |
| GEDCOM Navigator | https://github.com/ajkessel/gedcom-navigator | Fuzzy names, FAN research, relationship paths | Fuzzy identity variants and lateral-family searches |
| Genea Web | https://github.com/satvikgosai/genea-web | Local/privacy-first GEDCOM | Private local graph design |


## MomTo v4 design

1. **Local graph first** — imported Ancestry GEDCOM is the starting evidence graph.
2. **Two parent lanes** — birth-mother and birth-father research remain separate so one plausible lead cannot silently contaminate the other.
3. **Source diversification** — searches can target general web, FamilySearch, WikiTree, and Ohio official/archive sources.
4. **Parallel execution** — independent searches run concurrently; database writes stay deterministic and sequential.
5. **Deduplication** — canonical URLs are normalized before leads are persisted.
6. **Evidence before identity** — search hits are leads, never parent conclusions.
7. **Negative evidence matters** — future cycles should record searched sources/queries that produced no useful result.
8. **Human gate** — no contact action or identity conclusion is automated.
9. **Private/public split** — names, snippets, queries, candidate URLs, and DNA identities remain private; public output is aggregate-only.

## Git provenance

Reference repositories were checked on 2026-09-19. The registry records repository identity and intended capability only; MomTo does not claim that any reference project's code is part of MomTo.


## Added in the all-toolkit integration

MomTo now registers all identified open-source genealogy toolkits as capability references and
implements the useful ideas natively rather than copying third-party runtime code:

- **GEDCOM correctness:** preserve the imported graph as the authoritative private source and
  prepare it for stricter GEDCOM validation.
- **Fuzzy identity:** generate alternate spellings/orderings and discriminate by dates/places.
- **Relationship paths:** inspect parent, spouse, sibling, grandparent and collateral paths
  before treating a candidate as meaningful.
- **FAN research:** search friends/associates/neighbors/extended-family signals around each
  birth-parent lane.
- **Timeline consistency:** compare dates and residences instead of relying on name matches alone.
- **Duplicate/contradiction review:** keep possible duplicate people and conflicting facts as
  review items rather than silently merging them.
- **Privacy-first graph:** private tree contents remain local; public output remains aggregate-only.

These are MomTo-native implementations inspired by the referenced projects. Their source code is
not copied into MomTo.
