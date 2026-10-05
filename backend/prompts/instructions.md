---
name: instructions-for-workflow-development
description: Use this base for instructions around the development

---


### Basic Directives and Instructions

When creating code, have in mind some style about the repo:

* Avoid unecessary comments! Use comments only when it fully makes sense and, when so, keep it concise in one or, at maximum, two lines. Comments shall not reference plan phases/steps — the codebase should read as self-contained, independent of this tracking document. 
* Pay attention at the name of the files. It uses 'kebab-case'. path/name-folder/name-file. Keep this for file names.
* The existing repo suffix convention uses .[TYPE IDENTIFIER].ts (.rep.ts, .ctrl.ts, .bs.ts, .types.ts, .command.ts, .command-handler.ts, .query.ts, .query-handler.ts, .dto.ts). When creating a new "type identifier file", try to keep the same style.



### architecture-evolution.md

This project follows the plan described in 'architecture-evolution.md'. The user will prompt to execute each step.
When and if it's going to be added information inside the step description after the implementation, use the word ' - Result:' and then add lines following ' -- '. SUMMARIZE IT. RESULT SHALL NOT BE MORE THAN 7 LINES OR 100 WORDS. Example:

- [✅] **4.4 Read models / DTOs**
  - Create `src/application/dtos/` — plain output shapes (e.g., `TournamentSummaryDTO`, `MatchWithPlayersDTO`).
  - Query handlers map Sequelize rows to DTOs; controllers only receive DTOs.
  - Result: 
  -- 7 DTOs added: `PlayerDTO`, `TournamentDTO`, `PhaseDTO`, `MatchDTO` (each `InferAttributes<Model>`-based, matching the existing `GroupWithPlayers` convention), `GroupDTO`/`GroupStandingsDTO` (re-exports of the already-existing `GroupWithPlayers`/`GroupWithStats` types rather than duplicates), and `TournamentMatchesDTO` (formalizing the inline `{phases:[...]}` shape `GetTournamentMatchesQueryHandler` already built by hand). Chosen deliberately as a 1:1 formalization of the current response shapes, not a trim to only what the frontend's TS types declare — zero wire-format change, still gets the real benefit (a named contract that won't silently grow when the schema does), without a breaking change nothing asked for.
  - *Why? Because* controllers currently return raw Sequelize model instances, which serialize every column (including internal ones), leak database column names into the API contract, and make it impossible to reshape a response without touching the model. A DTO owns the output contract — it changes when the API spec changes, independently of how data is stored.