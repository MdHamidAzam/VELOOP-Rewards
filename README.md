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

## Production deployment

The simplest supported architecture is:

1. Deploy the existing `server` Express application to a Node hosting provider such as Render, Railway, or Fly.io.
2. Configure the provider start command as `npm start` from the `server` directory.
3. Set production backend variables in the provider dashboard: `MONGO_URI`, `JWT_SECRET`, `ADMIN_USER_IDS`, `NODE_ENV=production`, provider `PORT`, and `CLIENT_URL`.
4. Deploy the existing `client` Vite application to Vercel.
5. Set `VITE_API_BASE_URL` in Vercel to the deployed backend API base URL. Do not use localhost in the production value.
6. Build the frontend with `npm run build` and publish the generated `client/dist` output through the Vercel build configuration.

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

## Verification

```bash
npm --prefix client run build
cd server
npm start
```

The MongoDB-backed E2E validation completed for authentication, wallet, participation, winner finalization, claims, authorization, and transactions. Browser checks were run separately in demo mode and through the same-origin Vite proxy.
