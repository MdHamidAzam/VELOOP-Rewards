# VELOOP Giveaway

A premium rewards and giveaway app with a dark VELOOP aesthetic, React frontend, Express backend, and a local development demo mode.

> Development note: this project is usable in local demo mode when MongoDB is not configured. Demo data is intentionally labelled and must not be treated as real production storage or wallet activity.

## Project purpose

The app focuses on:

- giveaway discovery
- prize browsing
- giveaway details and eligibility
- participation flow and validation
- wallet and entry-fee checks
- winner and previous-winner display
- prize claim UX

## Frontend

- React + Vite
- React Router
- responsive CSS modules
- homepage, giveaway detail page, login page
- navbar, countdown, prize cards, modals, tabs, FAQ, rules, trust content

### Main routes

- /
- /giveaway/:giveawayId
- /login

## Backend

- Node.js + Express
- JWT-based auth middleware
- validation and rate-limiting middleware
- MongoDB/Mongoose data models and routes
- winner and claim service structure

### API surface

- POST /api/auth/dev-login
- POST /api/auth/register
- POST /api/auth/login
- GET /api/giveaways/current
- GET /api/giveaways/previous
- GET /api/giveaways/:giveawayId
- GET /api/giveaways/:giveawayId/winners
- GET /api/giveaways/previous/winners
- POST /api/giveaways/:giveawayId/participate
- GET /api/wallet
- GET /api/giveaways/:giveawayId/my-status
- POST /api/giveaways/:giveawayId/claim
- GET /api/giveaways/:giveawayId/claim
- PATCH /api/giveaways/:giveawayId/claims/:claimId/status
- POST /api/giveaways (admin: create giveaway)
- PATCH /api/giveaways/:giveawayId (admin: update giveaway)
- POST /api/giveaways/:giveawayId/prizes (admin: add prize configuration)
- PATCH /api/giveaways/:giveawayId/prizes/:prizeId (admin: update prize configuration)

Giveaway management writes require a valid bearer token whose user ID is listed in `ADMIN_USER_IDS`. Create/update payloads are allow-listed and audited. No delete operation is provided; prize records remain attached to historical records.

## Local development

From the project root:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

Run the client and server together:

```bash
npm run dev
```

The Vite development proxy sends `/api` requests to `http://localhost:5000`. The client uses demo data only when running in Vite development mode without `VITE_API_BASE_URL`.

## Environment variables

Copy the templates before editing local values. Never commit `.env` files.

Backend `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
ADMIN_USER_IDS=
```

- `MONGO_URI` is required for MongoDB-backed operation and production.
- `JWT_SECRET` is required in production and must be a strong random secret.
- `ADMIN_USER_IDS` is a comma-separated list used by admin-only routes.
- `NODE_ENV=production` disables development login and requires MongoDB/JWT configuration.
- `PORT` defaults to `5000`; hosting platforms provide their own value.
- `CLIENT_URL` is the exact deployed frontend origin used by CORS.
- `REFRESH_SECRET` is currently loaded but no refresh-token route consumes it.

Frontend `client/.env`:

```env
VITE_API_BASE_URL=/api
```

Use `/api` with the local Vite proxy. For a separately hosted frontend, set `VITE_API_BASE_URL` to the deployed backend API base URL, including `/api`.

## MongoDB and seed scripts

MongoDB Atlas is required for persistence. Run seed scripts only against the intended development database:

```bash
cd server
npm run seed:giveaways
npm run seed:wallets
npm run seed:winner-fixture
```

The winner fixture is development-only and should not be run against production data.
The fixture seeder rejects `NODE_ENV=production`. For a legacy E2E record already present in production, `npm run classify:winner-fixture` only sets `isTestFixture: true` on the exact `GW-2026-WINNER-E2E` giveaway; in production it additionally requires `CONFIRM_MARK_E2E_FIXTURE_PRIVATE=GW-2026-WINNER-E2E`. The script does not delete winners, participations, transactions, or audit history. Production public giveaway and winner reads exclude both tagged fixtures and this legacy ID.

## Production deployment

Current deployment:

- Frontend: [https://veloop-giveaway-nu.vercel.app/](https://veloop-giveaway-nu.vercel.app/)
- Backend API: [https://veloop-rewards-api.onrender.com/](https://veloop-rewards-api.onrender.com/)
- Database: MongoDB Atlas

The production API base URL is `https://veloop-rewards-api.onrender.com/api`.

The deployment architecture is:

1. The existing `server` Express application runs on Render with `npm start` from the `server` directory.
2. Render requires `MONGO_URI`, `JWT_SECRET`, `ADMIN_USER_IDS`, `NODE_ENV=production`, its provided `PORT`, and the deployed frontend origin in `CLIENT_URL`.
3. The existing `client` Vite application runs on Vercel.
4. Vercel uses `VITE_API_BASE_URL=https://veloop-rewards-api.onrender.com/api`; no MongoDB or JWT secrets are exposed to the frontend.
5. The frontend is built with `npm run build`.

The backend remains authoritative for authentication, wallets, participation, winner selection, and claims. The frontend never connects directly to MongoDB.

## Production authentication

Production accounts use `POST /api/auth/register` and `POST /api/auth/login` with an email and password. Passwords are stored as bcrypt hashes, and successful responses contain only the generated access token, user ID, email, and token type. New accounts receive a generated `USR-...` user ID; wallet balances are provisioned separately through the existing wallet architecture and are never invented during registration.

`POST /api/auth/dev-login` remains available only when `NODE_ENV` is `development` or `test`. Existing seeded development wallet IDs continue to work with that flow. Do not enable or use development login in production.

## Security notes

- Keep `.env` and provider secrets out of source control.
- Use a unique strong `JWT_SECRET` in production.
- Restrict `CLIENT_URL` to the exact frontend origin; do not use `*`.
- Use a MongoDB user scoped to the application database and restrict Atlas network access.
- Do not use development seed data or demo mode as production storage.

### Participation risk policy

- LOW (0-29): allow participation.
- MEDIUM (30-59): hold the request for review; do not deduct a balance or create participation while held.
- HIGH (60-79) and CRITICAL (80-100): block participation.
- A shared device/network signal is a review signal, not proof of fraud or a permanent account sanction. The current device-match signal produces a medium-risk hold and records a fraud event plus audit event.

## Verification

```bash
npm --prefix client run build
cd server
npm start
```

### Runtime verified

- MongoDB connection and seed scripts
- Development login and JWT-protected requests
- Production registration/login and production rejection of `dev-login` before the final token-boundary hardening
- Wallet reads, participation, authoritative deduction, transaction creation, duplicate protection, and MongoDB transaction behavior
- Winner finalization, persistence, masking, repeat-finalization rejection, and admin authorization
- Digital claim submission, duplicate protection, winner-only access, and `SUBMITTED` -> `PROCESSING` -> `COMPLETED`
- Active, ended, archived, previous-winner, and non-winner states using the real API
- Frontend build and same-origin browser smoke flows

### Code-level verified or not runtime verified

- Production demo-token rejection, disabled-account checks, and authentication rate limiting are covered by source inspection and focused configuration probes; the final live MongoDB regression run after this hardening was blocked by a local server startup timeout.
- Eligibility fields (`minAge`, countries, verified-user requirement) are modeled and displayed but are not enforced because User has no corresponding profile fields and the participation service does not apply them.
- No upcoming giveaway exists in the current database, so upcoming-state runtime verification is blocked.
- Physical claim submission, claim expiry execution, and the `EXPIRED` transition were not runtime executed.
- Rate-limit behavior was inspected in code; no abusive/high-volume runtime test was performed.
- The backend has no public admin giveaway/prize management workflow; seeded data is the configuration path.
- `REFRESH_SECRET` is loaded for configuration compatibility but no refresh-token route exists.
- Deployment credentials and provider dashboards are not configured in this local workspace.

Deployment status is documented from the supplied current deployment state. Post-deployment runtime verification of these public URLs was not performed in this audit.

The final image audit found no missing imports or raw browser-relative image URLs. The ₹500 gift-card asset is mapped by prize ID, while the generic unused artwork remains intentionally unreferenced.
