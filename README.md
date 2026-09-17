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

## Setup

From the project root:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

Run the project:

```bash
npm run dev
```

## Environment variables

The server reads from server/.env using the template in server/.env.example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
ADMIN_USER_IDS=
```

## MongoDB requirement

MongoDB is required for the full database-backed version of the app. In this workspace, MONGO_URI is not configured, so the server starts in development demo mode without claiming persistence.

## Seed scripts

```bash
cd server
npm run seed:giveaways
npm run seed:wallets
```

These scripts are intended only for a configured MongoDB environment.

## Development authentication

The dev login flow is intentionally labelled as development authentication. It stores a local session token and is not production auth.

## Demo mode

Demo mode is used for local UI validation when backend persistence is unavailable.

Supported demo behaviors:

- browse giveaways and prizes
- view rules and FAQ
- view winner history
- validate loading and error states
- exercise login and participation UI flows

Not claimed in demo mode:

- real MongoDB persistence
- real wallet deduction
- real winner finalization
- real claim storage

## Known limitations

- MongoDB-backed winner selection and participation persistence cannot be verified here because MONGO_URI is unset.
- No external deployment or production credentials are configured in this workspace.
- Some backend behaviors remain modelled for demo validation rather than live database execution.

## Verification status

The project was validated with:

- Vite production build
- dev server startup in demo mode
- browser smoke checks for login and giveaway navigation

The database-backed lifecycle remains unverified in this environment due to the missing MongoDB configuration.
