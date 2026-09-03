# Architecture Evolution Plan — Champsly

> Purpose: learning-grade platform. Every step here is chosen to teach a real principle, not to solve a scaling problem that doesn't exist yet. Phases are ordered so the codebase compiles and runs correctly after each one. This plan lives at the monorepo root because it now covers more than the backend alone — frontend hosting (10.8), Lambdas (8.6, 10.7), and Terraform (8.7, 10.2) all live as siblings to `backend/`, not inside it.

---

## 1. Current State Audit

### What to Keep

- **Awilix DI container** — constructor injection is the right pattern; keep `.scoped()` lifetime per request.
- **Three-layer split** (controller → interactor → repository) — the split exists and is respected; the naming convention (`*.ctrl.js`, `*.bs.js`, `*.rep.js`) is readable and worth keeping.
- **Sequelize with PostgreSQL** — the ORM choice is fine; the migration setup via `.sequelizerc` is correct.
- **Round-robin scheduling algorithm** in `GenerateGroupsPhaseMatchesInteractor` — logic is sound and self-contained; keep it.
- **`awilix-express` `scopePerRequest`** — child container per request is the right approach for scoped services.

### What to Fix (Bugs / Structural Problems)

| # | File | Problem |
|---|------|---------|
| 1 | `src/infra/db/models/phase.js` | `associate` is defined twice — the second definition overwrites the first, so `hasMany(Match)` is silently dropped. |
| 2 | `src/interactors/phases/create-phase.bs - Copia.js:Zone.Identifier` | Windows Zone.Identifier artifact; should be deleted. |
| 3 | `src/adapters/repositories/groups.rep.js` | Standings/stats calculation (wins, points) lives inside the repository — business logic leaking into the data layer. |
| 4 | `src/interactors/groups/create-group.bs.js` | `CreateGroupInteractor` has an `addPlayersInGroups` method — a single-group creator shouldn't own a bulk player-assignment operation. |
| 5 | `src/interactors/tournaments/create-tournament.bs.js` | Calls `createGroupInteractor` and `createPhaseInteractor` directly — interactors should not depend on other interactors; this creates hidden coupling and makes unit testing hard. |
| 6 | `app.js` | Port `4001` and DB config hardcoded; no `.env` support. |
| 7 | `src/infra/http/routes.js` | CORS origin `http://127.0.0.1:5174` hardcoded. |
| 8 | `config/config.json` (root) | References MySQL — stale, never used; Sequelize CLI actually reads `config-sequelize.js` via `.sequelizerc`. |
| 9 | All interactors | No input validation; raw `req.body` reaches business logic. |
| 10 | All controllers | No global error handler; unhandled promise rejections crash silently. |

### What to Change (Architecture Evolution)

The model is **anemic** — entities are plain data bags with no behavior. There are no domain events, no CQRS boundary, and no observability hooks.

The approach here is **DDD-lite**, not full DDD. The use-case structure (`create-tournament.bs.js`, `update-match.bs.js`) is a strength worth keeping — it makes what the system does immediately navigable. Full DDD with bounded contexts would add indirection without a reason: this domain is small and cohesive, "Player" and "Tournament" mean exactly one thing everywhere, and there are no conflicting models across subdomains. What is genuinely missing is entity behavior and type-safe value objects, both of which can be added without reorganizing the folder structure.

---

## 2. Target Architecture (end state)

```
HTTP Layer          → Express controllers (thin, validation only)
Application Layer   → Command Handlers (writes) / Query Handlers (reads) [CQRS]
                      Use-case structure preserved; interactors renamed to handlers
Shared              → Value Objects (src/shared/value-objects/)
                      Domain Events base + named events (src/shared/events/)
                      Custom error classes (src/shared/errors/)
Infrastructure      → Repository implementations (Sequelize, src/infra/db/repositories/)
                      Event Bus — in-memory → Kafka (src/infra/events/)
                      AWS adapters (LocalStack: SQS/SNS/S3)
                      Observability (OTEL + Sentry + Pino + Prometheus)
Platform            → Docker Compose → Kubernetes manifests
```

> From Phase 1.11 onward the codebase is TypeScript (Sequelize migrations excepted). From Phase 1.12 onward, every repository is accessed through an `interface` defined in `src/shared/repositories/<resource>.types.ts` rather than the concrete Sequelize class — this is what makes the ports in Phase 4.1 an extension of an existing contract instead of a new one.

> **Observability tooling decision:** the stack is OTEL/Jaeger (traces) + Sentry (error tracking) + Prometheus/Grafana (metrics) + Loki/Promtail (logs) — the standard open-source "three pillars" set, plus Sentry for error triage, which none of the other three do well. OpenSearch/Kibana was considered as a Loki alternative for log aggregation and deliberately left out: it solves the same problem as Loki (log search), and running both would be redundant. Loki wins here because it stays inside the same Grafana pane already used for traces and metrics, while Elasticsearch/OpenSearch's full-index architecture is heavier to self-host (JVM, shard management) for no benefit this project needs. Revisit this only if the goal shifts toward demonstrating ELK/OpenSearch specifically for a target job description.

> **Monorepo structure decision:** `backend/`, `frontend/`, `lambdas/*`, and `terraform/*` all live in one repository, and any future microservice joins them the same way, instead of each becoming its own repo. This is the right call *because* the explicit goal is "clone once, run everything" — a polyrepo would mean pinning compatible versions across repos and wiring compose/env files across repo boundaries, which fights that goal directly. It also means a change to the API contract (e.g., 1.7/1.8's v1→v2 versioning) and the frontend code that consumes it can land in one commit instead of two coordinated releases across two repos.
>
> This convenience has a real cost if left unmanaged, so three things are non-negotiable as more services are added (formalized in section 5):
> - **CI must be path-scoped per service** (`paths: backend/**`, `paths: lambdas/schedule-preview/**` in GitHub Actions) — otherwise a frontend typo-fix triggers a full backend redeploy.
> - **Terraform state stays per-service** even though the code is colocated — 8.7's LocalStack state and 10.2's real-AWS state are already separate, and every new service/Lambda gets its own state, not a shared one. One repo must never mean one `terraform apply` blast radius.
> - **Commits carry a scope prefix** (`feat(backend): ...`, `fix(frontend): ...`, `chore(lambdas): ...`) — a monorepo's `git log` interleaves every service's history, and an unscoped commit message becomes much harder to attribute later.
>
> Repo size/clone time — the usual monorepo objection — isn't a real concern here: that cost only bites at the scale of a company-wide monorepo (Google, Meta), not a handful of small Node services and Lambdas.

---

## 3. Implementation Phases

---

### Phase 1 — Foundation Hardening
*Goal: the codebase is correct, configurable, and observable at the HTTP boundary.*

**Steps:**

[✅] **1.1 Delete artifact file** `src/interactors/phases/create-phase.bs - Copia.js:Zone.Identifier`
  - *Why? Because* Windows Zone.Identifier metadata files can cause unexpected module resolution failures on Linux and pollute `require` lookups — any tooling that globs `.js` files will attempt to load it.

- [✅] **1.2 Fix Phase double-associate bug**
  Merge the two `Model.associate` calls in `phase.js` into a single function that sets both `hasMany(Match)` and `belongsTo(Tournament)`.
  - *Why? Because* the second `associate` definition silently overwrites the first. The `hasMany(Match)` relationship is never registered, so any query that tries to eager-load Matches through a Phase will either silently return nothing or throw a cryptic Sequelize error at runtime — the kind of bug that takes hours to trace.

[✅] **1.3 Environment variables — `dotenv`**
  - Install `dotenv`.
  - Create `.env` (gitignored) and `.env.example` (committed).
  - Move port, DB credentials, CORS origin, and `NODE_ENV` into env vars.
  - Load in `app.js` before any other import.
  - *Why? Because* hardcoded values couple configuration to code — every environment change (local vs. Docker vs. staging) requires editing source files. It also risks committing credentials to version control. The twelve-factor app methodology treats config as environment, not code.

[✅] **1.4 Global error handler middleware**
  - Create `src/infra/http/middlewares/error-handler.middleware.js`.
  - Define a base `AppError` class (`src/shared/errors/app-error.js`) and subclasses: `NotFoundError`, `ValidationError`, `ConflictError`.
  - Add the middleware as the last `app.use` in `app.js`.
  - Repositories replace `throw new Error(...)` with typed errors.
  - *Why? Because* without a centralized handler, unhandled promise rejections either crash the process or return inconsistent responses (sometimes an HTML stack trace, sometimes an empty body) instead of a predictable JSON error shape. Typed errors also allow the handler to map domain failures to the correct HTTP status codes without each controller repeating that logic.

[✅] **1.5 Request validation — Zod**
  - Install `zod`.
  - Create schema files per resource under `src/infra/http/schemas/` (e.g., `tournament.schema.js`).
  - Create a `validate` middleware factory that parses `req.body` against a schema and calls `next(new ValidationError(...))` on failure.
  - Apply to all POST/PUT routes.
  - *Why? Because* raw `req.body` currently reaches business logic with no guarantees about types, presence, or shape. A missing required field causes a confusing null-reference failure deep inside an interactor instead of an immediate, descriptive 400 response at the boundary. Validation at the HTTP layer keeps the domain clean from defensive null-checks.

[✅] **1.6 Structured logging — Pino**
  - Install `pino` and `pino-http`.
  - Register a `logger` singleton in the Awilix container (`asValue`).
  - Replace all `console.log` / `console.error` calls with `logger.info` / `logger.error`.
  - Add `pino-http` middleware to `app.js` for automatic request/response logging.
  - *Why? Because* `console.log` produces unstructured plain text — it has no severity levels, no request correlation ID, and cannot be shipped to a log aggregator without parsing. Pino emits JSON logs that can be filtered by field, correlated across requests by a trace ID, and directly ingested by Grafana Loki in Phase 6.

[✅] **1.7 API versioning**
  - Prefix all routes with `/api/v1`.
  - Update Postman collection accordingly.
  - *Why? Because* once a frontend or mobile client depends on a route's shape, changing that shape is a breaking change. A `/v1/` prefix lets you iterate on `/v2/` without removing the old contract, decoupling the backend release cycle from every client that consumes it.

[✅] **1.8 Simulate a v2 route — evolve one endpoint without breaking v1**
  - Pick one existing endpoint whose *response shape* needs to change: `GET /get-players` currently returns a bare array (`[{...}, {...}]`).
  - Simulate the product need: v2 should return a paginated envelope — `{ data: [...], meta: { count } }` — while v1 clients keep receiving the bare array exactly as before.
  - Reorganize `routes.js` into `src/infra/http/routes/v1/index.js`, moving every existing route into it verbatim, then mount it: `router.use('/api/v1', v1Router)`.
  - Create `src/infra/http/routes/v2/index.js`. It does `router.use(v1Router)` first — inheriting all other routes completely unchanged — then overrides only the one route that actually changed: `router.get('/get-players', getPlayersV2Controller)`.
  - Create `getPlayersV2Controller` (`src/controllers/players/get-players-v2.ctrl.js`). It resolves the *same* `getPlayersInteractor` from the container — business logic is untouched — and only reshapes the output into the new envelope.
  - Mount both in the top-level router: `router.use('/api/v1', v1Routes)` and `router.use('/api/v2', v2Routes)`.
  - *Why? Because* without the `/v1`/`/v2` split already in place from 1.7, there is no seam to hang a second behavior on, and changing `/get-players` would force one of three worse options: (a) change the response in place and silently break the frontend the moment it deploys separately from this change, (b) branch inside the single existing controller on a header or query param (`if (req.query.version === '2') {...}`), turning one controller into an ad-hoc, untested version switch that only gets messier with every future change, or (c) copy the entire `routes.js` file and every controller it references into a parallel structure just to isolate the one endpoint that changed, duplicating 20+ untouched routes to change one. With the version-prefixed folders, the *only* new code is the one overridden route and its controller — every other route is inherited for free via `router.use(v1Router)`, which is the entire point of doing 1.7 first.

[✅] **1.9 Rate limiting — `express-rate-limit`**
  - Install `express-rate-limit`.
  - Apply a global limiter in `app.js` (e.g. 100 requests/minute per IP) and a stricter limiter on write routes (`POST`/`PUT`/`DELETE`).
  - Use the default in-memory store for now.
  - *Why? Because* without a rate limit, a single client — malicious or just a buggy retry loop — can exhaust the DB connection pool or run up costs with unbounded requests. An in-memory store is the right choice for a single process, but it stops being accurate the moment more than one process handles traffic: each instance counts independently instead of sharing one count, so a client can get roughly `N × limit` through against `N` instances. That gap isn't fixed here — it's revisited in Phase 10.6 once the real deployment actually has an edge that sees all traffic (API Gateway throttling), which is the layer where a shared limit can actually be enforced.

- [✅] **1.10 Docker Compose for local dev**
  - Create `docker-compose.yml` at project root with services: `api`, `db` (Postgres), and a placeholder `zookeeper`+`kafka` (to be used later).
  - Update `config-sequelize.js` to read host from env so both Docker and localhost work.
  - *Why? Because* "works on my machine" is not a reproducible environment. Docker Compose makes the DB, the Kafka broker, and the API start in a single command for any contributor and mirrors the topology that Kubernetes will manage later — the closer local dev is to production, the fewer environment-specific bugs you'll encounter.

- [✅] **1.11 TypeScript migration**
  - Install `typescript`, `tsx` (or `ts-node`), `@types/node`, `@types/express`, `@types/cors`.
  - Add `tsconfig.json` — `target: ES2022`, `module: commonjs`, `moduleResolution: node`, `strict: true`, `esModuleInterop: true`, `rootDir: src`, `outDir: dist`.
  - Rename every source file under `src/` and `app.js` from `.js` to `.ts`, keeping the existing suffix convention (`*.ctrl.ts`, `*.bs.ts`, `*.rep.ts`). Sequelize migrations stay `.js` — the CLI reads them independently of the app build.
  - Type the Sequelize models using `InferAttributes`/`InferCreationAttributes` generics (no need to adopt `sequelize-typescript`).
  - Define a `Cradle` interface enumerating every Awilix registration and pass it to `createContainer<Cradle>()`, so `container.resolve('x')` is compile-time checked instead of returning `any`.
  - Update `npm run dev` to `tsx watch app.ts`; add `npm run build` (`tsc`) and point `npm start` at `dist/app.js`.
  - *Why? Because* the codebase is 82 files / ~2,300 lines today — this is the smallest it will ever be. Phase 2 introduces Value Objects and status enums whose entire purpose (illegal states unrepresentable) is what TypeScript's type system gives natively; hand-validating those as plain JS classes now and re-expressing them as TS types later would mean doing the same work twice. Converting now means every phase after this one is written in TS from the start.

- [✅] **1.12 Dependency Inversion — repository interfaces**
  - For each resource with a repository, add a `*.types.ts` file under `src/shared/repositories/`, e.g. `src/shared/repositories/player.types.ts` — a neutral location, not nested inside either `adapters/repositories/` or `interactors/<resource>/`.
  - This file exports the interactor's input/output shapes *and* the repository port itself as an `interface`, e.g.:
    ```ts
    export interface PlayerRepository {
      findById(id: string): Promise<Player | null>;
      create(data: CreatePlayerInput): Promise<Player>;
      // ...
    }
    ```
  - Interactors (`player.bs.ts`) import only the `PlayerRepository` type from `src/shared/repositories/player.types.ts` — never the concrete Sequelize repository class — and receive an implementation through the Awilix constructor exactly as before.
  - The concrete repository (`player.rep.ts`) declares `export class PlayerRepository implements PlayerRepository` (renaming the export where it would collide, e.g. `SequelizePlayerRepository`), so the compiler fails the build the moment the repo's shape drifts from the port.
  - Repeat for `Tournament`, `Phase`, `Group`, `Match`, `Player`. Awilix registration tokens in `register.js` don't change — only what interactors import changes.
  - *Why? Because* this is the Dependency Inversion Principle enforced by the compiler instead of by convention: interactors depend on an abstraction, not on the concrete Sequelize class living in the adapters layer. JSDoc `@interface` documents intent but never fails a build when a repo's shape drifts — a real TS `interface` does. The port lives in `src/shared/repositories/` rather than colocated inside the owning resource's interactor folder because a repository's output shapes aren't always resource-private — `GroupRepository.getTournamentGroups()`'s `GroupWithStats`/`PlayerWithStats` types, discovered during 1.11 cleanup, are consumed by `phases` interactors, not just `groups` ones. Nesting the port inside one resource's interactor folder would force a sibling resource to reach across interactor folders to use it — exactly the interactor-to-interactor coupling Phase 2 bans — so it goes in `shared/` instead, alongside `shared/errors/` and the value-objects/events folders Phase 2 adds. Doing this immediately after the TS migration means every interactor is unit-testable with a hand-written fake from this point forward, instead of waiting for Phase 4's CQRS split to justify introducing ports.

- [✅] **1.13 Rebrand — Truco Platform → Champsly**
  - Rename every occurrence of "truco"/"Truco Platform" across the monorepo to "Champsly": `backend/package.json`'s `name` (→ `champsly-backend`, then regenerate `package-lock.json`), `backend/CLAUDE.md`, `frontend/CLAUDE.md`, this plan's own title, `backend/docs/collection_postman.json`, and `frontend/vite.config.ts`'s dev-server proxy target.
  - Rename the Docker Compose services (`truco-platform-frontend/-backend/-db/-zookeeper/-kafka` → `champsly-frontend/-backend/-db/-zookeeper/-kafka`) and every hostname reference that depends on them (`DATABASE_URL`, `KAFKA_ZOOKEEPER_CONNECT`, `KAFKA_ADVERTISED_LISTENERS`, the frontend Vite proxy target, `backend/.env`'s `DB_HOST`).
  - Rename the Postgres database itself via `ALTER DATABASE truco RENAME TO champsly;` against the running container — not by recreating the volume — so local dev data survives; update `POSTGRES_DB` in `docker-compose.yml` and `DB_DATABASE` in `backend/.env`/`.env.example` to match. Named volumes (`postgres_data`, `backend_node_modules`, `frontend_node_modules`) are untouched, so `docker compose down` (no `-v`) + `up` reuses them under the renamed services.
  - Generalize the one line in `backend/CLAUDE.md` that described the API as managing "Truco card game tournaments" specifically.
  - *Why? Because* the domain model never actually encoded anything Truco-specific — no card ranks, no suits, no Truco scoring rules, just `Tournament`/`Phase`/`Group`/`Match`/`Player` and a generic round-robin scheduler. The name was a leftover from the platform's original single-game framing; "Champsly" doesn't imply a specific game, which matches what the platform actually does.

---

### Phase 2 — Entities & Value Objects (DDD-lite)
*Goal: entities own their invariants and status fields are type-safe; the use-case folder structure stays completely intact.*

No `src/domain/` folder. No bounded contexts. No aggregate roots or repository ports at this stage — those arrive in Phase 4 where the concrete reason (CQRS read/write separation) makes them obviously useful. What gets added here are two things that improve correctness in any architecture: value objects that make illegal states unrepresentable, and entity methods that centralise business rules instead of scattering them across interactors.

**Steps:**

- [✅] **2.1 Value Objects**
  - Create `src/shared/value-objects/`.
  - `TournamentStatus` — enum: `draft | active | finished`.
  - `MatchStatus` — enum: `waiting | in_progress | finished`.
  - `Score` — wraps `{ player1: number, player2: number }`; validates non-negative integers; exposes `winner()`.
  - `PhaseType` — enum: `groups | knockout`.
  - Interactors and models import from `src/shared/value-objects/` — no other structural change required.
  - *Why? Because* status fields are currently plain strings — nothing prevents `status: 'strated'` (typo) or `status === 'Finished'` (wrong casing) from silently passing through the system. A Value Object makes illegal states unrepresentable: if `TournamentStatus` only knows `draft`, `active`, and `finished`, any other value is a construction error caught immediately, in one place, not scattered across every `if` that checks status.

- [✅] **2.2 Add behavior to existing entities**
  - Add methods directly to the Sequelize model files or introduce thin wrapper classes alongside them — no new folder.
  - `Tournament`: `canStart()`, `canFinish()` — boolean guards that interactors call before mutating.
  - `Match`: `recordResult(score: Score)` — sets `winner_player_id` from `Score.winner()`, transitions `MatchStatus`.
  - `Group`: `canAddPlayer(playerId, currentPlayers)` — guard against duplicate entries.
  - *Why? Because* the current entities are anemic — they hold fields but own no rules. When business rules live scattered across interactors, the same invariant gets duplicated and drifts independently. Moving the rule to the entity makes "can a tournament start right now?" answerable in one authoritative place, regardless of which use-case asks the question.

- [✅] **2.3 Move stats computation out of GroupRepository**
  - `GroupRepository.getTournamentGroups()` should return raw group + player data only.
  - Create `src/shared/services/GroupStandingsService.ts` — a plain function that receives groups and matches and computes wins/points.
  - Call it from `GetGroupsInteractor` (or from the query handler when Phase 4 arrives).
  - *Why? Because* a repository's only job is to persist and retrieve data. Computing standings encodes tournament rules — what counts as a win, how points accumulate. When that logic lives inside the repository it is untestable without a DB connection and invisible to any interactor that might need the same calculation. Extracting it to a service makes it a pure function: in goes data, out comes standings.

- [✅] **2.4 Decouple CreateTournamentInteractor**
  - Remove direct calls to `createGroupInteractor` and `createPhaseInteractor`.
  - Inject `tournamentRepository`, `groupRepository`, and `phaseRepository` directly instead.
  - Move the group/phase creation loops into private methods of `CreateTournamentInteractor`.
  - Remove `addPlayersInGroups` from `CreateGroupInteractor`; move it to `CreateTournamentInteractor` or extract to a dedicated `AssignPlayersToGroupsInteractor`.
  - *Why? Because* an interactor that calls other interactors builds a hidden call graph where responsibilities blur and the unit under test is never truly isolated — mocking `createGroupInteractor` in a test still hides whatever `createGroupInteractor` does internally. Each interactor must depend only on repositories and shared services so it can be tested and reasoned about in isolation.

- [✅] **2.5 Domain Events infrastructure (in-memory)**
  - Create `src/shared/events/` with a base `DomainEvent` class (fields: `eventId`, `occurredOn`, `aggregateId`).
  - Initial named events: `TournamentCreated`, `MatchResultRecorded`, `PhaseCompleted`.
  - Create `src/infra/events/InMemoryEventBus.ts` — simple pub/sub; registered in Awilix as `eventBus`.
  - Interactors collect events during execution and dispatch them to the bus after the repository write succeeds.
  - *Why? Because* side effects are currently hardwired as direct method calls inside interactors — every new side effect requires modifying the same class. An event bus inverts this: the interactor announces what happened, and independent subscribers react. This is also the groundwork for Phase 5: swapping `InMemoryEventBus` for `KafkaEventBus` without touching a single interactor.

---

### Phase 3 — Authentication & Login
*Goal: users can register, log in, and own their tournaments, secured by a properly hardened bearer-token scheme — both the API and the frontend that consumes it.*

Authentication is deliberately its own phase, not a Phase 2 step: it isn't a DDD refinement of the existing domain, it's a new bounded concern (identity) layered on top of it. It sits before Phase 4 (CQRS) on purpose — every write in the app is about to need an ownership check ("does this tournament belong to the caller?"), and it's far cheaper to bake that into the command/query handlers as they're built than to retrofit it into every handler a second time afterward. Unlike every other phase so far, this one deliberately touches the frontend as well as the backend — a login system that only exists as an API isn't a login system yet.

The mechanism is a **bearer JWT access token + rotating refresh token**, not server-side sessions: the frontend and backend are already separate deployables, a future mobile client is a possibility, and a session store (Redis, sticky sessions) is exactly the kind of shared state Phase 9/10's horizontally-scaled deployment doesn't otherwise need. "Simplest possible" was the original framing for the login flow's *product* shape (register → already logged in → verify email later); it is explicitly **not** the framing for the token mechanism itself — a shortcut there is the kind of thing that gets a project fairly criticized, and the extra pieces below (rotation, revocation, minimal claims) are cheap relative to that risk.

**Steps:**

- [✅] **3.1 Database migration — `users` and `refresh_tokens` tables**
  - `users`: `id`, `email` (unique), `password_hash`, `status` (`pending_verification` | `verified`), `created_at`, `updated_at`.
  - `refresh_tokens`: `id`, `user_id`, `token_hash` (never the raw token), `expires_at`, `revoked_at` (nullable), `replaced_by_id` (nullable, for rotation chains), `created_at`.
  - Add a nullable `user_id` column to `tournaments` to establish ownership.
  - *Why? Because* everything else in this phase — hashing, rotation, revocation, ownership — needs these columns to exist first, and a nullable `user_id` on `tournaments` lets existing rows (created before auth existed) get backfilled or explicitly claimed without a destructive migration.

- [✅] **3.2 User entity & value objects**
  - `src/shared/value-objects/`: `Email` (validates format, normalizes casing), `AccountStatus` (`pending_verification | verified`).
  - `src/infra/db/models/user.ts` following the existing model conventions (`InferAttributes`/`InferCreationAttributes`).
  - *Why? Because* this is the same DDD-lite pattern Phase 2 established — illegal states (`status: 'confrimed'`) unrepresentable, `Email` validated once at construction instead of scattered regex checks. The password itself is never modeled as a value object holding plaintext; only the hash is ever stored or passed around (see 3.3).

- [✅] **3.3 Password hashing & token infrastructure**
  - Install `bcrypt` (or `argon2`) and `jsonwebtoken`.
  - `src/infra/auth/password-hasher.ts` — wraps hash/compare, cost factor configurable via env.
  - `src/infra/auth/token-service.ts` — signs/verifies short-lived access tokens (e.g. 15 min; claims limited to `sub`, `exp`, `iat`, `jti` — no email or other PII, since a JWT payload is signed, not encrypted) and generates opaque refresh tokens (random bytes, persisted only as a hash per 3.1).
  - Signing secret loaded from env (`.env`, per 1.3), never hardcoded.
  - *Why? Because* keeping the access token short-lived limits how long a leaked token is useful, and storing only the refresh token's hash means a leaked database dump doesn't hand out usable tokens — the same reasoning that already keeps passwords out of the database in plaintext.

- [✅] **3.4 Register endpoint**
  - `POST /api/v1/auth/register` — validates `{ email, password }` via a Zod schema (1.5 pattern), hashes the password, creates the `User` with `status: pending_verification`.
  - Issues an access token and a refresh token immediately — the user is logged in from the first response; verification is a follow-up step, not a login gate.
  - Access token returned in the response body; refresh token set as an `httpOnly`, `Secure`, `SameSite=Strict` cookie.
  - Publishes a `UserRegistered` domain event (2.5's event bus) carrying the user id and a freshly generated, single-use, time-limited verification token.
  - *Why? Because* splitting "create the account" from "prove the email" was the explicit product requirement — a user shouldn't be stuck on a screen waiting for a mail that may never arrive (e.g. a mistyped address) before they can use the app at all.

- [✅] **3.5 Email verification**
  - A subscriber (`src/infra/events/subscribers/send-verification-email-on-user-registered.ts`) listens for `UserRegistered` and calls an `EmailSender` port with the verification link/code.
  - `src/shared/mail/email-sender.types.ts` defines the `EmailSender` port; `src/infra/mail/ConsoleEmailSender.ts` is the only implementation for now — it logs the link via Pino instead of sending real mail.
  - `POST /api/v1/auth/verify-email` — consumes the token, flips the matching user's `status` to `verified`. Tokens are single-use and expire (e.g. 24h); an expired/used token returns a clear, re-requestable error.
  - *Why? Because* this is the same swap-the-infrastructure-not-the-domain-logic pattern already used for the event bus (in-memory now, Kafka in Phase 5) and for LocalStack vs. real AWS (Phase 8 vs. Phase 10): building against a port means the eventual move to a real mail provider (SES, in Phase 10) touches one new adapter file, not the registration flow itself.

- [✅] **3.6 Login endpoint**
  - `POST /api/v1/auth/login` — validates credentials against the stored hash, issues a new access + refresh token pair exactly like registration.
  - Returns the same generic error for "no such user" and "wrong password" — never reveal which one it was.
  - *Why? Because* login and registration both end at "an authenticated session," so they share the token-issuing logic from 3.3 rather than duplicating it; distinguishing "wrong email" from "wrong password" in an error message is a well-known account-enumeration leak.

- [✅] **3.7 Refresh token rotation & revocation**
  - `POST /api/v1/auth/refresh` — reads the refresh cookie, validates the matching `refresh_tokens` row (not revoked, not expired), issues a new access token *and* a new refresh token, marks the old row `revoked_at` + `replaced_by_id`, and sets the new cookie.
  - If a refresh token that's already marked revoked is presented, treat it as theft: revoke the entire chain descended from it and force re-login.
  - `POST /api/v1/auth/logout` — revokes the current refresh token row; the cookie is cleared client-side.
  - *Why? Because* this is the concrete answer to "JWTs can't be revoked": the access token stays stateless and just expires quickly, but the refresh token is tracked server-side, so logout and theft-detection are both real. Reuse of an already-rotated refresh token is the standard signal that a token was stolen and replayed — reacting to it (killing the whole chain) is what makes rotation worth doing instead of just issuing a longer-lived token.

- [✅] **3.8 Auth middleware**
  - `src/infra/http/middlewares/authenticate.middleware.ts` — reads the `Authorization: Bearer <token>` header, verifies it via `token-service.ts`, attaches `req.user` (id only) or calls `next(new UnauthorizedError(...))`.
  - New `UnauthorizedError`/`ForbiddenError` classes alongside the existing `AppError` subclasses (1.4), wired into the same global error handler.
  - Apply to every route except `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/verify-email`, and `/health`.
  - *Why? Because* this is the one place "is this request authenticated" gets decided — every protected controller trusts `req.user` instead of re-implementing token verification, the same reasoning that put validation and error handling behind shared middleware in 1.4/1.5.

- [✅] **3.9 Ownership — scope tournaments to their owner**
  - `CreateTournamentInteractor` sets `user_id` from `req.user` (threaded through from the controller) on creation.
  - `GetTournamentsInteractor`/`ReadTournamentInteractor`/`UpdateTournamentInteractor`/`DeleteTournamentInteractor` filter or authorization-check by `user_id`; a mismatch throws `ForbiddenError`.
  - Groups/Phases/Matches are authorized transitively through their parent tournament's `user_id` rather than getting their own owner column.
  - *Why? Because* this is the actual point of doing auth before Phase 4's CQRS split — every command/query handler written from here on is authored with the ownership check already in mind, instead of Phase 4 shipping handlers that then need a second pass to add authorization.

- [✅] **3.10 Harden the auth surface**
  - Add a stricter `express-rate-limit` (1.9) limiter scoped to `/auth/*` — tighter than the global limit, to blunt credential stuffing and verification-token brute-forcing.
  - Install `helmet`; enable a Content-Security-Policy that blocks inline scripts/`eval`.
  - Zod schemas for every new endpoint's body (1.5 pattern): `email`, `password` (minimum length/complexity), `token`.
  - *Why? Because* token hygiene (3.3, 3.7) only protects the token once a request is legitimate — Helmet/CSP and rate limiting are what reduce the odds of XSS executing or a login endpoint being brute-forced in the first place, which matters at least as much as how the token is stored.

- [✅] **3.11 Frontend — auth state & API client**
  - `AuthContext`/`AuthProvider` (`frontend/src/features/auth/`) holding the access token and current user in memory only (component state, never `localStorage`/`sessionStorage`) — cleared on tab close/reload by design.
  - Consolidate the existing per-feature `axios.create()` instances (`players-api.ts`, `groups-api.ts`, `phases-api.ts`, `matches-api.ts`, `tournaments-api.ts`) behind one shared client (`frontend/src/lib/api-client.ts`) so the interceptor logic below only has to exist once.
  - That client's interceptor attaches `Authorization: Bearer <token>` to every request; on a `401`, it calls `/auth/refresh` once (the browser sends the `httpOnly` cookie automatically) and retries the original request with the new access token, or redirects to `/login` if the refresh itself fails.
  - *Why? Because* this is where the in-memory-token decision from 3.3/3.7 actually gets implemented on the client — the token never touches persistent client-side storage, so an XSS payload can't read it out after the fact, only during a live execution. Consolidating the axios instances first is what makes "add the interceptor once" true instead of five times.

- [✅] **3.12 Frontend — register, login, and verification screens**
  - `RegisterPage`/`RegisterForm` and `LoginPage`/`LoginForm`, following the existing form component conventions (`TournamentForm`, `PhaseForm`).
  - A "check your email" state shown immediately after registration (the user is already logged in, so this is informational, not a gate).
  - `VerifyEmailPage` — reads the token from the URL, calls `/auth/verify-email`, shows success/expired-link states with a "resend verification email" action.
  - *Why? Because* the backend flow (3.4/3.5) is only real to a user once there's a screen that reflects it — "you're in, but check your email when you get a chance" needs to actually be visible, not just true at the API level.

- [✅] **3.13 Frontend — protected routes and "my tournaments"**
  - A route wrapper that redirects to `/login` when `AuthContext` has no user, applied to every existing tournament/phase/group/match route.
  - Tournament list/create/edit screens now implicitly operate on "my tournaments" (the backend already scopes by `user_id` per 3.9); add a visible logout action to the nav.
  - *Why? Because* 3.9 makes the backend refuse to return another user's tournaments, but the frontend still needs a logged-out state to redirect from and a way to actually end a session, or the "you must be logged in" reality has no visible entry/exit point.

---

### Phase 4 — CQRS
*Goal: reads and writes are completely separate paths.*

**Steps:**

- [ ] **4.1 Split repository interfaces for read/write (builds on 1.12)**
  - The repository ports already exist as of Phase 1.12 (`*.types.ts` per resource under `src/shared/repositories/`) — this step is no longer about creating interfaces from scratch.
  - Where a query handler's read shape genuinely diverges from the write repository (e.g., a read method needs a joined DTO instead of a raw entity), extend the resource's `*.types.ts` with a second, narrower interface (e.g., `PlayerReadRepository`) rather than widening the original port.
  - Move Sequelize implementations from `src/adapters/repositories/` to `src/infra/db/repositories/`, keeping each `implements` clause intact.
  - Register in Awilix under the same tokens — no changes needed in handlers.
  - *Why? Because* now that ports are compiler-enforced from Phase 1.12, CQRS doesn't need to invent interfaces — it only needs to decide, per method, whether the read path requires a shape the write interface doesn't already provide. Keeping one interface per resource unless reads truly diverge avoids splitting for its own sake.

- [ ] **4.2 Commands and Command Handlers**
  - Create `src/application/commands/` — one file per command, e.g., `CreateTournamentCommand.ts` (a plain data class).
  - Rename current write interactors to `*CommandHandler` under `src/application/commands/handlers/`.
  - Command handlers: receive a command object, execute domain logic, persist, dispatch events.
  - *Why? Because* mixing read and write intent inside a single "interactor" class makes the code harder to reason about, harder to optimize, and harder to evolve independently. A command is an explicit, named declaration of intent to change state — it makes the "what is this code supposed to do" question answerable at a glance.

- [ ] **4.3 Queries and Query Handlers**
  - Create `src/application/queries/` — one file per query, e.g., `GetTournamentMatchesQuery.ts`.
  - Query handlers live in `src/application/queries/handlers/` — they read directly from the DB via read-optimized repository methods and return DTOs.
  - Query handlers must **never** mutate state.
  - *Why? Because* reads have fundamentally different requirements than writes: they need to be fast, can be safely cached, can hit read replicas, and must never produce side effects. Separating them makes those constraints enforceable at the code level — a query handler that calls a command handler is a compile-time (or lint-time) violation, not a runtime surprise.

- [ ] **4.4 Read models / DTOs**
  - Create `src/application/dtos/` — plain output shapes (e.g., `TournamentSummaryDTO`, `MatchWithPlayersDTO`).
  - Query handlers map Sequelize rows to DTOs; controllers only receive DTOs.
  - *Why? Because* controllers currently return raw Sequelize model instances, which serialize every column (including internal ones), leak database column names into the API contract, and make it impossible to reshape a response without touching the model. A DTO owns the output contract — it changes when the API spec changes, independently of how data is stored.

- [ ] **4.5 Wire CQRS into controllers**
  - Controllers resolve a `CommandBus` or `QueryBus` (simple dispatcher registered in Awilix) rather than specific interactors.
  - This decouples controllers from handler implementations.
  - *Why? Because* if controllers resolve handlers by their exact registered name, adding, renaming, or splitting a handler requires editing both the handler file and every controller that references it. A bus acts as an indirection layer — the controller says "dispatch this command," and the bus decides which handler runs.

- [ ] **4.6 Separate read DB connection (optional, advanced)**
  - Configure a second Sequelize instance pointing to a read replica (or the same DB for now).
  - Query handlers use the read instance; command handlers use the write instance.
  - This is a prep step for eventual consistency patterns.
  - *Why? Because* even on the same database server today, pointing reads at a dedicated connection pool prepares the code to route queries to a read replica with zero application changes later. This is how you scale reads horizontally — not by rewriting business logic, but by changing a connection string.

---

### Phase 5 — Event-Driven Architecture with Kafka
*Goal: side-effects are triggered by events, not direct calls.*

**Steps:**

- [ ] **5.1 Add Kafka to Docker Compose**
  - Add `zookeeper` and `kafka` services (or use `kafka-kraft` single-broker setup).
  - Add `kafka-ui` service for local visibility.
  - *Why? Because* running Kafka locally through Docker Compose is the only practical way to develop and test event-driven flows without a shared broker. The placeholder added in Phase 1 can now be activated. `kafka-ui` makes the otherwise opaque broker visible — you can inspect topics, consumer lag, and message payloads without writing a consumer just to debug.

- [ ] **5.2 KafkaEventBus**
  - Install `kafkajs`.
  - Create `src/infra/events/KafkaEventBus.ts` implementing the same interface as `InMemoryEventBus`.
  - Register conditionally: use Kafka in `production`/`development`, in-memory in `test`.
  - Topics map 1:1 to domain events: `tournament.created`, `match.result-recorded`, `phase.completed`, `user.registered`.
  - *Why? Because* the in-memory event bus from Phase 2 is lost on process restart — it has no durability, no replay capability, and no fan-out to other services. Kafka provides a durable, ordered, replayable log that survives restarts and can deliver the same event to multiple independent consumer groups simultaneously.

- [ ] **5.3 Consumers**
  - Create `src/infra/events/consumers/` — one file per consumer group.
  - Example: `MatchResultConsumer` listens on `match.result-recorded` and updates group standings in a read model.
  - Example: `PhaseCompletionConsumer` listens for all matches in a phase to finish, then emits `phase.completed`.
  - Consumers run in the same process initially; can be extracted to separate services later.
  - *Why? Because* without consumers, events are published into Kafka but nothing reacts to them. Consumers turn events from a notification mechanism into the actual control flow of the system — enabling features like automatic standings recalculation and phase advancement without polling or tight coupling between the match update endpoint and the group standings logic.

- [ ] **5.4 Outbox pattern (reliability)**
  - Create an `outbox` table in the DB.
  - Command handlers write events to the outbox inside the same transaction as the aggregate change.
  - A background poller reads unpublished outbox rows and pushes them to Kafka, then marks them published.
  - Prevents event loss if Kafka is down when a command executes.
  - *Why? Because* publishing to Kafka after saving to the DB is two separate I/O operations. If the process crashes between them, the DB has the change but the event was never published — every consumer is permanently unaware of what happened. The outbox pattern makes event publication atomic with the aggregate change: either both succeed or neither does.

---

### Phase 6 — Observability
*Goal: production-grade visibility with minimal code overhead.*

**Steps:**

- [ ] **6.1 OpenTelemetry tracing**
  - Install `@opentelemetry/sdk-node`, auto-instrumentation packages for HTTP and Sequelize.
  - Initialize OTEL in `app.ts` before anything else (before the imports that need instrumenting).
  - Export traces to Jaeger (add `jaeger` to Docker Compose).
  - *Why? Because* when a request touches multiple layers or triggers multiple Kafka consumers, a single log line tells you nothing about which step was slow or which one failed. Distributed traces give you a full timeline of the entire request flow — HTTP handler → command handler → repository → DB query — with durations and errors at every hop.

- [ ] **6.2 Sentry — error tracking**
  - Install `@sentry/node`.
  - Initialize the SDK in `app.ts` alongside the OTEL setup from 6.1 — the Sentry and OTEL SDKs share the same trace ID automatically, so a Sentry issue links straight to its Jaeger trace.
  - Wire `Sentry.captureException()` into the global error handler (`error-handler.middleware.js`, Phase 1.4) so every `AppError` and unhandled exception is reported with full context, not just logged.
  - Use the free hosted tier rather than self-hosting — Sentry's self-hosted deployment is itself a multi-service app (Kafka, ClickHouse, Redis, Postgres) and not worth the operational cost for a learning project.
  - *Why? Because* traces (6.1) tell you *where* time went and logs (6.5) tell you *what* happened, but neither is built for error triage: grouping the same exception across thousands of occurrences, flagging which release introduced a regression, or alerting the moment a brand-new error type appears. That's a distinct, complementary concern — not a duplicate of tracing or logging — and it plugs directly into the error-handling work already done in Phase 1.4.

- [ ] **6.3 Prometheus metrics**
  - Install `prom-client`.
  - Create `src/infra/observability/metrics.ts` — register counters/histograms: `http_request_duration_seconds`, `domain_events_published_total`, `kafka_consumer_lag`.
  - Expose `/metrics` endpoint (separate from API routes, no auth needed internally).
  - *Why? Because* logs tell you what happened in individual requests; metrics tell you how the system behaves over time. Histograms and counters let you answer "what is the p99 latency of tournament creation?" or "how many match results were recorded in the last hour?" — questions that are impossible to answer quickly by scanning log files.

- [ ] **6.4 Grafana + Prometheus in Docker Compose**
  - Add `prometheus` and `grafana` services.
  - Provide a `prometheus.yml` scrape config.
  - Add a pre-built Grafana dashboard JSON for the tournament domain (matches per hour, phase completion rate, active tournaments).
  - *Why? Because* metrics that nobody looks at are useless. A domain-specific Grafana dashboard translates raw Prometheus counters into tournament-meaningful insights and makes observability tangible during development — you can watch live as a tournament progresses through phases rather than inferring it from logs.

- [ ] **6.5 Log aggregation**
  - Add `loki` and `promtail` to Docker Compose.
  - Configure Pino to write JSON logs to stdout; Promtail ships them to Loki.
  - Add Loki as a Grafana data source.
  - *Why? Because* `docker logs` is a dead end once you have multiple replicas or containers restarting. Loki + Promtail gives you a central, persistent, queryable log store that survives container restarts and correlates with traces and metrics in the same Grafana UI — this is the "logs" leg of the observability triad (traces, metrics, logs). Loki was kept over OpenSearch/Kibana deliberately — see the observability tooling decision note in section 2.

- [ ] **6.6 Health and readiness endpoints**
  - `GET /health` — always 200.
  - `GET /health/ready` — checks DB connectivity and Kafka producer status; returns 503 if not ready.
  - *Why? Because* Kubernetes (Phase 9) needs a way to distinguish a pod that is starting up from one that is permanently broken, and a pod that is ready to receive traffic from one that is still warming up. Without these endpoints, k8s routes requests to pods that haven't established their DB connection yet, causing spurious errors during every deployment.

---

### Phase 7 — Testing Strategy
*Goal: a test suite that catches real bugs, not one that passes trivially.*

**Steps:**

- [ ] **7.1 Unit tests for domain entities and value objects**
  - Install `jest`.
  - Test every invariant enforced by entities: `Tournament.start()` throws if no players; `Score` rejects negative values; `Match.recordResult()` transitions status correctly.
  - No DB, no Sequelize, no Awilix — pure functions.
  - *Why? Because* domain logic is simultaneously the most valuable and the most fragile part of the system — a bug in `Score.winner()` corrupts every match result in the entire application. Pure unit tests run in milliseconds, have zero external dependencies, and give you a tight feedback loop that catches regressions before they leave your editor.

- [ ] **7.2 Unit tests for command/query handlers**
  - Mock repositories via simple in-memory implementations (not `jest.mock` of Sequelize).
  - Test that correct domain events are collected after handler execution.
  - *Why? Because* handlers orchestrate the most complex flows — create tournament → assign players → create groups → create phases. Testing them with in-memory repository fakes is far faster and more targeted than integration tests, and specifically proves that the handler emits the right events and calls the right repository methods in the right order, independent of DB behavior.

- [ ] **7.3 Integration tests**
  - Use `testcontainers` to spin up a real Postgres instance per test run.
  - Run migrations before tests.
  - Test full request → DB cycles via `supertest`.
  - *Why? Because* unit tests with in-memory repositories can pass while the actual SQL queries, Sequelize associations, or migration schemas are broken. Integration tests against a real DB catch the gap between what you think the ORM does and what it actually does — Sequelize association bugs, missing indexes, and migration drift are all invisible to pure unit tests.

- [ ] **7.4 Contract tests for Kafka events**
  - Define Avro/JSON Schema for each domain event.
  - Test that producers emit payloads conforming to the schema.
  - Test that consumers can deserialize those payloads.
  - *Why? Because* consumers and producers evolve independently across time (and potentially across services). A producer that renames a field in an event payload silently breaks every consumer that depends on it — the breakage only surfaces at runtime. Schema contracts make that breakage a failing test before the code is even deployed.

---

### Phase 8 — AWS via LocalStack
*Goal: learn AWS service integration without real AWS costs.*

**Steps:**

- [ ] **8.1 Add LocalStack to Docker Compose**
  - Mount a `localstack` service with `SERVICES=sqs,sns,s3,secretsmanager,lambda`.
  - *Why? Because* interacting with real AWS during development costs money, requires internet access, and creates shared mutable state between team members. LocalStack emulates the AWS APIs locally so you can develop and test integrations with zero cost, full isolation, and the ability to reset state by restarting a container.

- [ ] **8.2 Secrets management**
  - Move DB password and Kafka credentials into LocalStack SecretsManager.
  - Create `src/infra/config/secrets-loader.ts` that fetches secrets on startup using `@aws-sdk/client-secrets-manager` with endpoint override pointing to LocalStack.
  - *Why? Because* even env vars in a `docker-compose.yml` are readable by anyone with access to the file. SecretsManager centralizes secret storage, enables rotation without redeploying, and teaches the pattern used in every serious AWS production environment — your application fetches secrets at startup rather than receiving them as environment variables.

- [ ] **8.3 S3 — match export / event archive**
  - After a tournament finishes, serialize all match results to JSON and upload to an S3 bucket.
  - Implement as a Kafka consumer of `tournament.finished`.
  - *Why? Because* a relational database is optimized for live queries, not for cheap long-term storage of historical data. Archiving completed tournament data to S3 teaches data tiering — hot data in Postgres for active tournaments, cold data in object storage for finished ones — and demonstrates how a Kafka consumer can drive persistence to a completely different storage system.

- [ ] **8.4 SNS fan-out**
  - Publish domain events to an SNS topic; subscribe the Kafka topic (via SQS bridge) and a second, independent subscriber (built concretely in 8.6, as a Lambda function).
  - Demonstrates the fan-out pattern.
  - *Why? Because* a single Kafka topic delivers events to one consumer group at a time. SNS fan-out lets you deliver the same event to multiple, fully independent subscribers — Kafka for internal consumers, something else entirely for an external reaction — without the publisher knowing who is listening or needing to manage multiple delivery targets.

- [ ] **8.5 SQS dead-letter queue**
  - Configure a DLQ for the main consumer queue.
  - Add a local UI (LocalStack dashboard or a simple Express endpoint) to inspect DLQ messages.
  - *Why? Because* consumers fail — a malformed message, a temporary DB outage, or a bug in handler logic will prevent a message from being processed. Without a DLQ, that message either blocks the queue forever or is silently dropped. A DLQ captures messages that exceeded the retry limit so they can be inspected, fixed, and replayed — this is designing for failure, not hoping for success.

- [ ] **8.6 Lambda via LocalStack — `tournament-finished-notifier`**
  - Create a new auxiliary project at `lambdas/tournament-finished-notifier/` with its own `package.json` and handler — no dependency on the main app's Express/Sequelize/Awilix stack, only what the function itself needs.
  - Handler: receives the SNS message for `tournament.finished`, logs a structured notification (stand-in for a real webhook/Slack/email call).
  - Package it (zip) and deploy to LocalStack (`awslocal lambda create-function`, or via Terraform once 8.7 exists) with an SNS event source subscription to the topic from 8.4.
  - Trigger it end-to-end: finish a tournament, confirm the Lambda fires and logs the notification, independently of the Kafka consumer already handling the same event for a different purpose (8.3's S3 export).
  - *Why? Because* LocalStack emulates the actual Lambda runtime — handler signature, event payload shapes, packaging, cold starts — and real event-source wiring (SNS/SQS/S3 triggers) at zero cost, so there's no reason to wait for a billed AWS account to learn how Lambda actually behaves. It also gives 8.4's fan-out step a real second subscriber instead of a hypothetical one, and creates the pattern (a small, dependency-free, independently deployable function) that 10.7 later builds on for a genuinely serverless API route.

- [ ] **8.7 Terraform for LocalStack resources**
  - Install Terraform; add a `terraform/localstack/` directory.
  - Define the AWS provider with `endpoints` overridden to the LocalStack Docker service (e.g. `http://localstack:4566`).
  - Rewrite the SQS queue, SNS topic, S3 bucket, Secrets Manager entries, and the Lambda function + its SNS event source mapping from 8.1–8.6 as Terraform resources instead of ad hoc `awslocal`/SDK bootstrap calls.
  - `terraform apply` provisions everything against LocalStack; `terraform destroy` tears it down cleanly.
  - *Why? Because* Terraform against LocalStack costs nothing and can't run up a bill, making it the safe place to learn state files, plans, and resource lifecycle before pointing the same tool at a real, billable AWS account in Phase 10. It also makes the LocalStack setup reproducible from a clean `docker compose down -v` — no manual re-creation steps to remember or forget.

---

### Phase 9 — Kubernetes
*Goal: deploy the full stack locally with k8s to understand real operational concerns.*

**Steps:**

- [ ] **9.1 Kubernetes manifests**
  - Create `k8s/` at project root.
  - `Deployment` for the API (2 replicas).
  - `Service` (ClusterIP) + `Ingress` for the API.
  - `ConfigMap` for non-secret env vars.
  - `Secret` (base64) for credentials — or integrate with LocalStack SecretsManager via a sidecar.
  - *Why? Because* Docker Compose is a single-machine orchestrator with no concept of desired state, self-healing, or rolling updates. Kubernetes manifests teach you how production deployments actually work: you declare what you want, and the control plane continuously reconciles reality with your declaration — restarting crashed pods, spreading replicas across nodes, and routing traffic automatically.

- [ ] **9.2 Postgres on k8s**
  - Use the Bitnami Helm chart or a manual `StatefulSet` with a `PersistentVolumeClaim`.
  - *Why? Because* stateful workloads in k8s require fundamentally different primitives than stateless ones. A `StatefulSet` gives pods stable network identities and ordered startup/shutdown — critical for a database. The `PersistentVolumeClaim` teaches volume lifecycle: data survives pod restarts, but the pod and its storage are decoupled.

- [ ] **9.3 Kafka on k8s**
  - Use Strimzi operator or Confluent's Helm chart.
  - Define a `KafkaTopic` CRD for each domain event topic.
  - *Why? Because* running Kafka on k8s via an operator teaches you the Operator pattern — the dominant approach for complex stateful systems in Kubernetes. A controller watches Custom Resource Definitions and reconciles cluster state; a `KafkaTopic` CRD means topic configuration lives in version control alongside application code, not in a separate admin command.

- [ ] **9.4 Horizontal Pod Autoscaler**
  - Add an HPA targeting the API Deployment; scale on CPU or a custom Kafka consumer lag metric (via KEDA).
  - *Why? Because* a fixed replica count either over-provisions (wasting money) or under-provisions (dropping traffic under load). HPA teaches dynamic scaling — k8s adjusts replicas automatically based on observed load. Using KEDA to scale on Kafka consumer lag makes this domain-specific: more API pods spin up when there are more unprocessed match result events, not just when CPU is high.

- [ ] **9.5 Health probes**
  - Wire the `/health` and `/health/ready` endpoints to k8s `livenessProbe` and `readinessProbe`.
  - *Why? Because* without probes, k8s sends traffic to pods that are still establishing their DB connection pool, and restarts pods that are briefly slow rather than truly dead. The liveness probe tells k8s when to kill and restart a pod; the readiness probe tells k8s when to start sending traffic. These two signals together are the contract between your application and the orchestrator.

- [ ] **9.6 Local cluster setup**
  - Document using `minikube` or `kind` to run the full stack locally.
  - Provide a `Makefile` with targets: `make dev` (Docker Compose), `make k8s-up`, `make k8s-down`.
  - *Why? Because* without a reproducible local k8s environment, manifests only get tested in CI — feedback loops are slow, debugging is painful, and developers never build the intuition for how k8s actually behaves. `minikube` or `kind` gives you a full cluster on a laptop where you can iterate in seconds, break things safely, and understand what the control plane is actually doing.

---

### Phase 10 — Real AWS Deployment (Minimal-Cost Production)
*Goal: the project is genuinely live on the public internet, on real AWS, for the lowest realistic monthly cost — and every "textbook" service skipped for cost reasons is a documented, deliberate trade-off, not an oversight. This phase is deliberately independent of Phase 9: it does not use EKS, so it doesn't need the Kubernetes work done first.*

**Steps:**

- [ ] **10.1 Billing guardrails — before anything else exists**
  - Create an AWS Budget (e.g. $10/month) with alerts at 50/80/100% via SNS or email.
  - Create a dedicated IAM user with MFA for all CLI/Terraform work; the root account is never used day-to-day.
  - *Why? Because* a personal AWS account has no one else watching it — a misconfigured or forgotten resource (an idle NAT Gateway, an oversized instance left running) can generate real charges silently. A budget alert is free and costs nothing to set up first; it should exist before the first billable resource does, not after a surprise invoice.

- [ ] **10.2 Terraform remote backend**
  - Create an S3 bucket + DynamoDB lock table dedicated to Terraform state for real AWS, separate from the LocalStack config in 8.7.
  - *Why? Because* this state now represents a real, billed account — losing or corrupting it, or two applies racing each other, is a real risk here in a way it never was against LocalStack. A remote backend with locking is standard practice, and setting it up by hand is itself hands-on practice with S3 + DynamoDB on real AWS.

- [ ] **10.3 Minimal VPC networking**
  - One VPC, one public subnet (single-AZ — Multi-AZ is a documented, deliberate skip for cost, revisited in 11.2), an Internet Gateway, and a security group restricted to port 22 (your IP only), 80, and 443.
  - *Why? Because* a NAT Gateway alone costs roughly $32/month — more than the rest of this deployment combined — for a benefit (private-subnet egress) this project doesn't need yet. Skipping it isn't cutting a corner blindly; it's the same cost/benefit call a real team makes for a low-traffic service, and it's exactly the kind of trade-off the SAA exam expects you to reason through rather than always reaching for the "more secure" default.

- [ ] **10.4 Compute — single EC2 instance**
  - Provision one `t4g.micro` (or `t3.micro`) instance via Terraform.
  - Attach an IAM instance role (least privilege) instead of long-lived access keys on the box.
  - A user-data script installs Docker + Docker Compose, pulls the repo, and runs `docker compose up -d` — reusing the exact `docker-compose.yml` from step 1.10, unmodified.
  - *Why? Because* ECS Fargate bills per vCPU/GB-hour continuously for an always-on container and typically costs more than one small reserved/free-tier EC2 instance running the same workload; EKS carries a flat ~$73/month control-plane charge regardless of traffic. Both are the right answer for a team running many services at real scale — which is exactly what Phase 9's local Kubernetes work teaches — but neither fits what one hobby project actually needs to pay. Reusing the existing Compose file instead of rewriting deployment tooling also means everything built in Phases 1–8 ports over unchanged.

- [ ] **10.5 Database — RDS PostgreSQL**
  - Provision `db.t4g.micro`/`db.t3.micro`, single-AZ (Multi-AZ deliberately skipped — see 11.2), 7-day automated backups, security group scoped to only the EC2 instance's security group.
  - Point `config-sequelize.js` at the RDS endpoint via env vars.
  - *Why? Because* self-managing Postgres — patching, backup scripts, failover — is real operational work that RDS removes for a few dollars a month. This is the managed-database value proposition felt directly, instead of read about.

- [ ] **10.6 Public entry point + rate limiting — API Gateway (HTTP API), not ALB**
  - Create an HTTP API Gateway with an HTTP proxy integration pointing directly at the EC2 instance's public endpoint — no ALB and no VPC Link needed for a single instance.
  - Configure a Usage Plan / route throttling (burst and steady-state limits) at the gateway.
  - *Why? Because* an Application Load Balancer bills a flat hourly rate (~$16–20/month) whether it handles 10 requests or 10 million, while an HTTP API Gateway bills per request with a generous free tier and no hourly floor — for one low-traffic instance, the ALB is pure fixed overhead this project doesn't need (11.4 stands one up deliberately, temporarily, to compare directly). This step is also where rate limiting gets its real answer: the in-process limiter from 1.9 only protects one Node process, which happens to match today's single-instance reality, but it can't see traffic arriving through any other path. Enforcing the limit at the gateway means it holds regardless of how many instances end up behind it, without the app itself needing to coordinate anything.

- [ ] **10.7 Lambda-backed serverless route — the real justification for API Gateway**
  - Create a second auxiliary project at `lambdas/schedule-preview/` with its own `package.json` — a standalone handler that reimplements the pure round-robin scheduling logic already proven in `GenerateGroupsPhaseMatchesInteractor` (`src/interactors/phases/generate-groups-phase-matches.bs.js`), stripped of every repository/DB dependency: given a list of player names, return the generated round-robin schedule. No database, no VPC attachment.
  - Deploy it via Terraform (`aws_lambda_function` + a minimal-permissions `aws_iam_role` for Lambda execution — no RDS/VPC access needed).
  - Add one Lambda proxy integration route to the API Gateway from 10.6 — e.g. `POST /api/v1/schedule-preview` — while every other route keeps its existing HTTP proxy integration to EC2.
  - *Why? Because* 10.6 introduced API Gateway to replace an ALB for cost reasons, but that alone doesn't justify API Gateway's actual purpose — routing to genuinely serverless compute. A stateless, pure-computation endpoint with no persistent connection to manage is the textbook-correct Lambda candidate: no VPC attachment, no cold-start-to-RDS latency, no state to reason about. Routing only this one path to Lambda — instead of migrating the whole API — keeps the exercise honest: API Gateway now genuinely serves two different backend types on two different routes, which is how real serverless migrations actually happen (incrementally, one bounded piece at a time), not as a wholesale rewrite.

- [ ] **10.8 Frontend hosting — S3 + CloudFront**
  - Build the frontend and upload static assets to an S3 bucket configured for static website hosting; front it with CloudFront (free tier: 1TB/month for 12 months) for HTTPS and caching.
  - *Why? Because* running a second always-on server just to serve a built SPA is unnecessary cost when static hosting does the same job for cents — and it's the textbook-correct pattern for any SPA, not a shortcut taken to save money. This is what turns "a repo on GitHub" into "a working link to see the website running."

- [ ] **10.9 DNS + TLS (optional)**
  - Route53 hosted zone + ACM certificate (free) for a custom domain on both the API Gateway and the CloudFront distribution.
  - Skippable at zero extra AWS cost using the default `*.execute-api...`/`*.cloudfront.net` URLs if a domain isn't purchased yet.
  - *Why? Because* a custom domain is a cosmetic, professional-polish layer, not a functional requirement — worth doing for a portfolio project, but kept explicitly optional so cost never blocks the deployment from going live.

- [ ] **10.10 CI/CD — GitHub Actions**
  - Path-scoped workflows: a `backend/**` change runs lint/tests then redeploys to the EC2 instance (SSH or AWS SSM Run Command) with `git pull && docker compose up -d --build`; a `lambdas/schedule-preview/**` change repackages and redeploys only that Lambda; a `frontend/**` change rebuilds and syncs 10.8's S3 bucket.
  - *Why? Because* a live link that only updates when you remember to SSH in and redeploy manually will quietly drift from the repo — this is the mechanism that keeps "the code on GitHub" and "the site that's live" telling the same story. Scoping each workflow to its own path is what the monorepo structure decision (section 2) requires in practice: without it, editing the frontend would trigger a pointless EC2 redeploy, and the Lambda would never be releasable independently of the backend.

---

### Phase 11 — AWS Certification-Aligned Deepening
*Goal: use the live account from Phase 10 to deliberately practice AWS Solutions Architect Associate concepts beyond what the minimal deployment strictly needs — as bounded, cost-aware exercises, not permanent additions.*

**Steps:**

- [ ] **11.1 IAM deep dive**
  - Replace the single broad EC2 instance role from 10.4 with least-privilege, resource-scoped policies (e.g., S3 actions scoped to one bucket ARN, RDS describe-only where applicable).
  - Practice the IAM Policy Simulator against the new policies before applying them.
  - *Why? Because* the SAA exam treats IAM as the security foundation underneath every other service — practicing least-privilege here, on real resources you already understand, is far more durable than memorizing policy JSON in the abstract.

- [ ] **11.2 VPC deep dive (temporary)**
  - Add a private subnet + NAT Gateway; move RDS fully out of any publicly-routable subnet.
  - Observe the added ~$32/month cost directly on the account's billing dashboard, then explicitly decide — and record in this file — whether to keep it or tear it down.
  - *Why? Because* 10.3 deliberately skipped this pattern for cost; this step is where that trade-off gets actually measured instead of taken on faith. Seeing the real number is what makes a cost/security trade-off concrete rather than theoretical.

- [ ] **11.3 Auto Scaling Group**
  - Wrap the EC2 instance in a Launch Template + Auto Scaling Group (min 1, max 2, scale on CPU).
  - Compare its mechanics and cost directly against the HPA already built in Phase 9's local Kubernetes cluster.
  - *Why? Because* ASG and HPA solve the same problem — dynamic capacity — at different layers (VM vs. pod). Having built both, the difference stops being a line in a study guide and becomes something actually operated twice.

- [ ] **11.4 ALB side-by-side comparison (temporary)**
  - Stand up an Application Load Balancer in front of a second EC2 instance purely to compare latency, cost, and configuration against the API-Gateway-direct approach from 10.6.
  - Tear it down afterward; document the comparison rather than leaving both running.
  - *Why? Because* 10.6 chose API Gateway over ALB for cost reasons without ever running an ALB to compare against — this step closes that gap with a real, measured comparison instead of a one-sided justification.

- [ ] **11.5 S3 storage classes & lifecycle policies**
  - Apply Standard → Standard-IA → Glacier lifecycle transitions to the tournament-archive bucket created in 8.3.
  - *Why? Because* this applies a genuine cost-optimization lever — a core SAA topic — to data that already exists in the account, rather than a synthetic exercise bucket with nothing real in it.

- [ ] **11.6 CloudWatch dashboards + alarms**
  - Beyond the billing alarm from 10.1, add a dashboard covering EC2 CPU, RDS connections, and API Gateway 4xx/5xx rates.
  - *Why? Because* a live deployment with no operational visibility is exactly the gap Phase 6's observability stack fills locally — this is the AWS-native equivalent, and the SAA exam expects fluency with CloudWatch specifically, not "observability" in the abstract.

- [ ] **11.7 Well-Architected Framework self-review**
  - Walk the Phase 10 deployment against all six pillars (cost optimization, reliability, performance efficiency, security, operational excellence, sustainability).
  - Document every place a "textbook" choice was consciously skipped for cost (Multi-AZ RDS, private subnets, ALB, multiple instances) directly in this file, next to the step that made the trade-off.
  - *Why? Because* the Well-Architected Framework is both a real AWS deliverable and the lens the SAA exam grades every scenario question through — reviewing your own deployment against it is the closest hands-on equivalent to the exam's actual reasoning style.

---

### Phase 12 — Localization (i18n / l10n)
*Goal: everything a user reads — the frontend UI and transactional emails — is available in English and Portuguese. Internal-facing text (API error messages, validation responses, logs) is explicitly out of scope: nobody but the developer reads those, so translating them wouldn't serve a real user.*

This phase is placed last by explicit product decision, not because it is architecturally blocked on Phases 4–11 — CQRS, Kafka, observability, testing, and the AWS/k8s work are all backend/infra concerns that produce no user-facing copy, so none of them gate localization. The one real dependency is Phase 3: it's the first point where there's substantial UI copy (login/register/verify-email screens, 3.11–3.13) and a transactional email template (3.5's verification email) to actually translate, so this phase treats those as its first concrete localization targets rather than starting from a blank slate.

**Steps:**

- [ ] **12.1 User locale preference**
  - Add a nullable `locale` column to `users` (3.1's table), constrained to `en | pt`, defaulting to `en`.
  - Add a `PATCH /api/v1/users/me/locale` endpoint to let a logged-in user set it.
  - *Why? Because* this is the one piece of localization state that has to live on the backend — it's what tells 12.2 which language to render a transactional email in, and what the frontend reads on login to set its initial language instead of always starting in English.

- [ ] **12.2 Backend — localize transactional emails**
  - Extend the `EmailSender` port (3.5) so the subscriber passes the recipient's `locale` (12.1) alongside the existing verification link.
  - Template selection under `src/infra/mail/templates/<lang>/verification-email.ts` (`en`, `pt`); `ConsoleEmailSender` renders whichever template matches the locale, falling back to `en`.
  - *Why? Because* this is the same swap-the-adapter-not-the-domain-logic pattern already used for the event bus and mail sender in 2.5/3.5 — the subscriber's job (react to `UserRegistered`) doesn't change, only which template the port renders.

- [ ] **12.3 Frontend — i18n infrastructure**
  - Install `react-i18next` and `i18next-browser-languagedetector`.
  - Translation files under `frontend/src/i18n/locales/{en,pt}/`, organized by the existing feature folders (`tournaments.json`, `auth.json`, etc.) rather than one giant file.
  - A language switcher in the nav (English/Portuguese only), persisting the choice to `localStorage`; once a user is logged in, changing it also calls 12.1's `PATCH` so the preference follows them across devices.
  - *Why? Because* one place should resolve and expose the active locale instead of every component reaching for its own translation logic, and the two-language scope keeps the switcher itself simple — a dropdown of two options, not a locale picker built for a set that doesn't exist yet.

- [ ] **12.4 Frontend — translate the existing feature set**
  - Extract every hardcoded UI string across the tournament/phase/group/match/player screens and the auth screens (3.11–3.13) into translation keys.
  - Ship both English and Portuguese in full — no screen left partially translated — so string interpolation and pluralization (e.g. "1 match" / "2 matches" vs. Portuguese's own plural rules) are proven against a real second language, not just scaffolded for one.
  - *Why? Because* a single-language i18n setup hides exactly the bugs a second language exposes — string concatenation that assumes English word order, or pluralization logic that only happens to work for English.

- [ ] **12.5 Locale-aware date & number formatting**
  - Replace manual date/number formatting (match dates, standings, timestamps) with `Intl.DateTimeFormat`/`Intl.NumberFormat`, keyed off the active locale from 12.3 (`en-US`/`pt-BR` conventions).
  - *Why? Because* translating labels while leaving dates in a fixed format (e.g. `MM/DD/YYYY` shown to a Portuguese-reading user who expects `DD/MM/YYYY`) produces a UI that looks translated but still reads as foreign — formatting conventions are as much a part of localization as the words are.

---

## 4. Dependency Map Between Phases

```
Phase 1 (Foundation)
  └─► Phase 2 (DDD)
        └─► Phase 3 (Authentication & Login)
              └─► Phase 4 (CQRS)
                    └─► Phase 5 (Kafka)
                          └─► Phase 8 (AWS/LocalStack)
                                └─► Phase 10 (Real AWS Deployment)
                                      └─► Phase 11 (AWS Certification Deepening)
Phase 1
  └─► Phase 6 (Observability)   ← can run in parallel with Phase 2-5
Phase 2 + Phase 3
  └─► Phase 7 (Testing)         ← domain entities, incl. User/Email/AccountStatus,
                                  must exist before unit tests
Phase 5 + Phase 6
  └─► Phase 9 (Kubernetes)      ← health checks and metrics must exist first;
                                  local-only (minikube/kind), independent of
                                  Phase 10 — Phase 10 deliberately skips EKS for cost
Phase 3
  └─► Phase 12 (Localization)   ← only real dependency: auth's frontend screens
                                  and verification email exist to translate.
                                  Sequenced last by product decision, not by any
                                  blocking dependency on Phases 4-11.
```

---

## 5. Conventions to Establish Early (Phase 1)

- **File naming** — keep `*.ctrl.ts`, `*.bs.ts` (rename to `*.handler.ts` in Phase 4), `*.rep.ts` (extensions become `.ts` in Phase 1.11). Suffix signals layer.
- **Repository ports** — every resource with a repository gets a `*.types.ts` under `src/shared/repositories/` (Phase 1.12) exporting its interface; interactors/handlers import the interface, never the concrete repository class.
- **No interactor-to-interactor calls** — enforced from Phase 2 onward; use domain services or events instead.
- **Repositories return domain entities, not ORM instances** — add `.toDomain()` mapper methods in Phase 2.
- **Every domain event carries `aggregateId` and `occurredOn`** — established once in Phase 2, never revisited.
- **All status fields must use the corresponding Value Object** — no raw string comparisons in business logic.
- **Access tokens are bearer JWTs, never server-side sessions** — established in Phase 3; short-lived, minimal-claims, sent via `Authorization: Bearer`. Refresh tokens are the only thing ever put in a cookie, and always `httpOnly`.
- **CI triggers are path-scoped per service** (`backend/**`, `frontend/**`, `lambdas/<name>/**`, `terraform/**`) — a change under one path never builds, tests, or redeploys another service. Set up the first time CI is introduced (Phase 10.10), not retrofitted later.
- **Terraform state is per-service, never shared** — one state file/workspace per Lambda and per environment (LocalStack in 8.7, real AWS in 10.2). Colocated code in one repo must never mean one shared blast radius.
- **Commit messages carry a scope prefix** — `feat(backend): ...`, `fix(frontend): ...`, `chore(lambdas): ...` — since a monorepo's history interleaves every service and an unscoped message is much harder to attribute later.
