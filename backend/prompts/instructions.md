---
name: instructions-for-workflow-development
description: Use this base for instructions around the development

---


### Basic Directives and Instructions

When creating code, have in mind some style about the repo:

* Avoid unecessary comments! Use comments only when it fully makes sense and, when so, keep it concise in one or, at maximum, two lines. Comments shall not reference plan phases/steps — the codebase should read as self-contained, independent of this tracking document. 
* Pay attention at the name of the files. It uses 'kebab-case'. path/name-folder/name-file. Keep this for file names.
* The existing repo suffix convention uses .[TYPE IDENTIFIER].ts (.rep.ts, .ctrl.ts, .bs.ts, .types.ts, .command.ts, .command-handler.ts, .query.ts, .query-handler.ts, .dto.ts). When creating a new "type identifier file", try to keep the same style.


### Way and Style of Coding: READABILITY MATTERS A LOT!
* Always think about easier human readability. Sometimes a code can be wrote in only one or two lines, but the readability is not simple. Prefer the other way around.
Example:

Option a)
// Starts every series at 0: increase()/rate() can't see a series' first increment, so it would be lost.
getAllRegistrations().forEach((registration) => domainEventsPublished.inc({ event_type: registration.eventClass.name }, 0));

Option b) 
// Starts every series at 0: increase()/rate() can't see a series' first increment, so it would be lost.
const INITIAL_EVENT_COUNT = 0;
getAllRegistrations().forEach((registration) => {
    const eventType = registration.eventClass.name;

    domainEventsPublished.inc({ event_type: eventType }, INITIAL_EVENT_COUNT);
});

Choose option b!


### architecture-evolution.md

This project follows the plan described in 'architecture-evolution.md'. The user will prompt to execute each step.
When and if it's going to be added information inside the step description after the implementation, use the word ' - RESULT:' and then add lines following ' -- '. SUMMARIZE IT. RESULT SHALL NOT BE MORE THAN 7 LINES OR 100 WORDS and only 2 bullets when possible (3 at maximum). Example:

- [✅] **4.4 Read models / DTOs**
  - Create `src/application/dtos/` — plain output shapes (e.g., `TournamentSummaryDTO`, `MatchWithPlayersDTO`).
  - Query handlers map Sequelize rows to DTOs; controllers only receive DTOs.  
  - *Why? Because* controllers currently return raw Sequelize model instances, which serialize every column (including internal ones), leak database column names into the API contract, and make it impossible to reshape a response without touching the model. A DTO owns the output contract — it changes when the API spec changes, independently of how data is stored.
  - RESULT: 
  -- 7 DTOs added: `PlayerDTO`, `TournamentDTO`, `PhaseDTO`, `MatchDTO` (each `InferAttributes<Model>`-based, matching the existing `GroupWithPlayers` convention), `GroupDTO`/`GroupStandingsDTO` (re-exports of the already-existing `GroupWithPlayers`/`GroupWithStats` types rather than duplicates), and `TournamentMatchesDTO`. 
  -- They were chosen deliberately as a 1:1 formalization of the current response shapes, not a trim to only what the frontend's TS types declare.