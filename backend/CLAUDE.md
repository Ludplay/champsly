# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start (production-like)
npm start

# Start with auto-reload
npm run dev

# Run database migrations
npm run migrate
# or directly:
npx sequelize db:migrate
```

No test suite is configured. The app runs on port **4001**.

## Docker Dev Environment

The backend normally runs inside Docker Compose (`docker-compose.yml` at the monorepo root), not as a bare host process. The `champsly-backend` service bind-mounts `./backend:/app` (so source edits are picked up live by `nodemon` via `npm run dev`), **but `node_modules` is a separate named volume** (`backend_node_modules:/app/node_modules`), not part of that bind mount.

This means running `npm install <pkg>` on the host only updates the host's `node_modules` — it has **no effect** on the running container, which keeps using its own volume's stale `node_modules`. After adding/updating any dependency:

```bash
docker compose exec champsly-backend npm install
```

Skipping this step causes the container to crash-loop on `MODULE_NOT_FOUND` for the new package the moment `nodemon` restarts it (which happens immediately, since the bind-mounted source file requiring that package has already changed). A plain `docker compose build`/`up` does **not** fix this either — Docker does not re-seed an already-existing named volume from a rebuilt image.

Port 4001 on the host is this container, not a locally-run `node app.js` — testing against `localhost:4001` exercises the real Docker container.

## Architecture

This is a Node.js/Express REST API for managing tournaments (Champsly). It follows a clean architecture with three layers connected via **Awilix** dependency injection:

```
Request → Controller → Interactor (business logic) → Repository → Sequelize Model → PostgreSQL
```

**Layer conventions:**
- `src/controllers/**/*.ctrl.js` — thin HTTP handlers; resolve interactors from `req.container`
- `src/interactors/**/*.bs.js` — all business logic; receive dependencies via constructor (`params`)
- `src/infra/adapters/repositories/**/*.rep.ts` — data access; wrap Sequelize models
- `src/infra/db/models/` — Sequelize model definitions with associations
- `src/infra/db/migrations/` — Sequelize CLI migrations

**DI wiring:** `src/infra/config/register.js` registers every class with Awilix as `.scoped()` (one instance per request). Controllers access the container via `req.container.resolve('interactorName')`. When adding a new feature, register both the repository and all interactors in that file.

**Routes:** Routes are defined under `src/infra/http/routes/v1/index.ts` and `src/infra/http/routes/v2/index.ts`. CORS is locked to `http://127.0.0.1:5173` (the frontend dev server).

## Domain Model

- **Tournament** — has many Phases, belongs to many Players (via `tournaments_players` join table)
- **Phase** — belongs to Tournament; a phase can be a "groups phase" or later elimination rounds
- **Group** — belongs to a Phase, has many Players (via `groups_players` join table)
- **Match** — belongs to Phase and optionally a Group; has `player1_id`, `player2_id`, `winner_player_id`, scores, `round_number`, and `status`
- **Player** — can participate in many Tournaments and Groups

The key business logic is `GenerateGroupsPhaseMatchesInteractor` (`src/interactors/phases/generate-groups-phase-matches.bs.js`), which implements a **round-robin scheduling algorithm** for all groups in a tournament's groups phase.

## Database Configuration

The app uses the config at `src/infra/config/config-sequelize.js` (PostgreSQL, host `champsly-db`, db `champsly`). This is also what Sequelize CLI uses (see `.sequelizerc`). The root `config/config.json` is unused/stale.

For local dev outside Docker, update the host in `config-sequelize.js` to `localhost` or `127.0.0.1`.
