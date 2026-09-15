# VELOOP Rewards — Giveaway Platform

A premium, responsive giveaway experience for VELOOP Rewards, designed to make reward discovery, participation, winner announcements, and prize information simple, engaging, and trustworthy.

> **Development Note:** Giveaway statistics, winner information, and other frontend demonstration data currently use realistic but fictional mock data for development purposes. They must not be interpreted as real VELOOP Rewards statistics or real-time activity.

---

## Project Overview

VELOOP Rewards Giveaway is a full-stack giveaway platform project developed as part of the VELOOP Rewards internship assignment.

The project is designed around a complete giveaway journey where users can:

- Discover giveaways
- Explore available prizes
- Review entry requirements
- Understand giveaway rules
- Check giveaway status
- View countdown information
- View winner announcements
- Explore current and previous winners
- Access individual giveaway details
- Participate through a secure backend flow
- Claim prizes after winning

The current implementation contains a polished React frontend and the initial backend architecture required for future database-backed integration.

---

## Giveaway Concept

The platform provides a reward-focused giveaway experience where users can discover premium prizes and follow the complete giveaway lifecycle.

The intended user journey is:

**Discover → Rewards → Rules → Join → Earn Entries → Countdown → Winner Announcement → Winner / Non-Winner → Prize Claim**

The interface is designed to feel:

- Premium
- Reward-focused
- Modern
- Interactive
- Trustworthy
- Responsive
- Realistic

The visual direction intentionally avoids casino-style or overly flashy giveaway experiences.

---

## Features

### Giveaway Experience

- Premium Giveaway Hero / Banner
- Giveaway statistics
- Featured giveaway section
- Reusable prize cards
- Live countdown
- ACTIVE / UPCOMING / ENDED giveaway states
- Individual giveaway details page
- Responsive layouts
- Accessible interactive components

### Information Sections

- How It Works
- Giveaway Rules & Guidelines
- FAQ
- Trust & Transparency
- Final Call-to-Action
- Footer navigation

### Winner Experience

- Winner announcement slider
- Current winners
- Previous winners
- Masked winner IDs
- Prize information
- Giveaway information
- Claim status information through mock data

### Backend Foundation

- Node.js
- Express.js
- MongoDB/Mongoose architecture
- Authentication middleware foundation
- Request validation
- Fraud protection middleware foundation
- Rate limiting architecture
- Participation API contract
- Structured API responses

---

## Giveaway States

The giveaway experience supports three primary states.

### ACTIVE

When a giveaway is active:

- Active status is displayed
- Live countdown is displayed
- Giveaway CTA is available
- Countdown updates automatically every second

### UPCOMING

When a giveaway is upcoming:

- Upcoming status is displayed
- Countdown runs toward the giveaway start date
- Participation remains unavailable
- Users are informed that participation opens soon

### ENDED

When a giveaway has ended:

- Ended status is displayed
- Active countdown is hidden
- Participation is closed
- Ended messaging is displayed

When an ACTIVE countdown reaches zero, the frontend automatically transitions to the ENDED state.

---

## Current Frontend Experience

The current Giveaway landing page contains:

1. Hero
2. Countdown
3. Statistics
4. Featured Giveaways
5. Giveaway Rules & Guidelines
6. How It Works
7. Winner Announcement
8. Winners / Previous Winners
9. Trust Section
10. FAQ
11. Final CTA
12. Footer

### Individual Giveaway Page

Every giveaway CTA leads to a dedicated giveaway details page.

Route:

```text
/giveaway/:giveawayId
```

Example:

```text
/giveaway/GW-2026-09
```

The individual page includes:

- Breadcrumb navigation
- Giveaway status
- Giveaway title
- Description
- Start and end dates
- Countdown
- Prize cards
- Eligibility information
- Participation information
- Giveaway rules
- How It Works
- FAQ
- Trust information
- Safe invalid-giveaway fallback

---

## Prize System

Prize information is maintained using structured giveaway data rather than being scattered throughout UI components.

Each prize can contain:

- ID
- Name
- Position
- Image
- Description
- Winner count
- Prize type
- Claim type
- Required currency
- Entry fee

The current development data contains prizes including:

- iPhone 15 Pro
- Apple Watch
- AirPods
- ₹2,000 Amazon Gift Card
- ₹500 Amazon Voucher
- ₹20 Voucher

Prize cards derive their configuration from the existing giveaway data.

This allows future giveaways and prize types to be added without rewriting presentation components.

---

## Winner System

Winner information is currently represented through structured mock data for frontend development.

The winner experience includes:

- Winner announcement slider
- Current winners
- Previous winners
- Masked VELOOP user IDs
- Prize information
- Giveaway information
- Claim status information

Winner IDs are displayed in a privacy-conscious masked format such as:

```text
VE****25
```

The frontend does not present mock winner information as real-time production activity.

Actual winner finalization will be handled by the backend during the backend integration phase.

---

## Prize Claim System

The assignment requires a winner-specific prize claim experience.

### Physical Prize Claim

For physical prizes, the claim form is intended to collect:

- Full Name
- Phone Number
- Complete Address
- City
- State
- PIN Code

### Amazon Gift Card Claim

For Amazon gift card prizes, the claim experience should collect:

- Email Address

A physical delivery address should not be requested for an Amazon gift card.

### Claim States

The intended claim lifecycle includes:

- Not Submitted
- Submitted
- Processing
- Completed
- Expired

The complete backend-connected claim flow is part of the later implementation phase.

---

## Non-Winner Experience

Users who do not win should not receive access to a winner claim form.

The intended experience provides:

- Winner information
- Previous winners
- Giveaway status
- Next giveaway information
- Future participation opportunities

The experience should clearly communicate that the user can continue participating in future giveaways.

---

## Participation System

The frontend is designed so that giveaway participation can later be connected to a secure backend without requiring a complete UI rewrite.

A participation API contract has been established.

### Participation Endpoint

```text
POST /api/giveaways/:giveawayId/participate
```

### Request Body

```json
{
  "prizeId": "PRIZE-APPLE-WATCH"
}
```

The client must not provide authoritative values for:

- User ID
- Balance
- Entry fee
- Currency
- Transaction amount

These values must be determined and verified by the backend.

### Current Status

The participation API currently contains the contract foundation.

The actual:

- Balance verification
- Currency deduction
- Database transaction
- Participation creation
- Entry transaction
- Audit transaction

are intentionally deferred to the backend implementation phase.

---

## API Documentation

### Participate in Giveaway

**Endpoint**

```text
POST /api/giveaways/:giveawayId/participate
```

**Authentication**

Authentication is required.

The authenticated user should be determined by backend authentication middleware.

**Request**

```json
{
  "prizeId": "PRIZE-APPLE-WATCH"
}
```

**Planned Success Response**

```json
{
  "success": true,
  "message": "Participation created.",
  "data": {
    "giveawayId": "<giveawayId>",
    "prizeId": "<prizeId>",
    "entryId": "<entryId>",
    "transactionId": "<transactionId>"
  }
}
```

### Error Responses

| Status | Meaning |
|---|---|
| 400 | Validation failure or unsupported request fields |
| 401 | Authentication required |
| 403 | Participation/fraud protection rejection |
| 404 | Giveaway or prize not found |
| 409 | Duplicate participation |
| 422 | Giveaway inactive, eligibility failure, or insufficient balance |
| 429 | Rate limit exceeded |
| 501 | Participation transaction not implemented |

The frontend should convert backend error codes into clear user-facing messages instead of exposing raw database or server errors.

---

## Technology Stack

### Frontend

- React.js
- Vite
- React Router
- Bootstrap
- CSS Modules
- React Hooks
- React Icons
- Framer Motion

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token authentication architecture
- Express Validator
- Helmet
- Express Rate Limit
- CORS
- Morgan
- bcryptjs

### Development

- Git
- GitHub
- VS Code
- Vercel

---

## Installation

Clone the repository:

```bash
git clone <GITHUB_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd VELOOP-Rewards
```

Install root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

Return to the project root:

```bash
cd ..
```

---

## Development

### Run Frontend

From the project root:

```bash
npm run client
```

Frontend:

```text
http://localhost:5173
```

### Run Backend

```bash
npm run server
```

Backend:

```text
http://localhost:5000
```

### Run Frontend and Backend Together

```bash
npm run dev
```

---

## Build

Create the production frontend build:

```bash
npm run build
```

The frontend production build is generated using Vite.

The project should be tested locally and the production build should pass before deployment.

---

## Folder Structure

```text
VELOOP-Rewards/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── logos/
│   │   │
│   │   ├── components/
│   │   │   ├── Countdown/
│   │   │   ├── FAQ/
│   │   │   ├── FeaturedGiveaways/
│   │   │   ├── FinalCTA/
│   │   │   ├── Footer/
│   │   │   ├── GiveawayHero/
│   │   │   ├── GiveawayRules/
│   │   │   ├── GiveawayStats/
│   │   │   ├── HowToParticipate/
│   │   │   ├── Navbar/
│   │   │   ├── PreviousWinnerCard/
│   │   │   ├── PrizeCard/
│   │   │   ├── PrizeClaimModal/
│   │   │   ├── TrustSection/
│   │   │   ├── WinnerCard/
│   │   │   ├── WinnerSlider/
│   │   │   └── WinnersTabs/
│   │   │
│   │   ├── context/
│   │   ├── data/
│   │   │   ├── faqData.js
│   │   │   ├── giveawayData.js
│   │   │   ├── mockUser.js
│   │   │   ├── prizeData.js
│   │   │   └── winnerData.js
│   │   │
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Error/
│   │   │   ├── Giveaway/
│   │   │   ├── GiveawayDetails/
│   │   │   ├── Login/
│   │   │   └── NotFound/
│   │   │
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   │
│   └── package.json
│
├── .gitignore
├── README.md
├── package.json
└── package-lock.json
```

---

## Component Architecture

The frontend follows a reusable component-based architecture.

### Giveaway Components

Reusable components handle:

- Hero presentation
- Giveaway statistics
- Prize presentation
- Countdown
- Giveaway rules
- How-to-participate information
- Winner announcements
- Winner lists
- Trust information
- FAQ

### Page Components

Page-level components compose reusable sections into complete experiences.

Current pages include:

- Giveaway landing page
- Individual Giveaway Details page
- Login page
- Error page
- Not Found page

### Data Layer

Giveaway configuration and mock data are maintained separately from presentation components.

This prevents giveaway configuration from being duplicated throughout the UI.

### Hooks

Reusable React Hooks are used for application behavior such as:

- Countdown handling
- Giveaway state handling
- Authentication state

---

## Responsive Design

The interface is designed and tested across:

- 320px
- 375px
- 768px
- 1024px
- 1440px

Responsive considerations include:

- Mobile-friendly hero layout
- Responsive prize cards
- Touch-friendly navigation
- Responsive statistics
- Readable winner sections
- Mobile-friendly CTA controls
- No horizontal page overflow

---

## Accessibility

Accessibility considerations include:

- Semantic HTML
- Semantic headings
- Keyboard-accessible controls
- Visible keyboard focus states
- Accessible navigation
- Accessible tabs
- `aria-expanded`
- `aria-controls`
- Meaningful image alt text
- Accessible interactive buttons
- Status information that does not rely only on color

---

## Animation Details

Animations are designed to improve interaction without distracting from the reward experience.

Current interactions include:

- Button hover transitions
- Prize card interactions
- Accordion expansion
- Winner slider navigation
- Countdown updates
- Mobile navigation interactions
- Subtle UI transitions

The visual design intentionally avoids:

- Excessive neon effects
- Casino-style visuals
- Excessive confetti
- Flashing animations
- Random glow effects
- Overly saturated effects

---

## Mock Data Structure

The frontend uses structured mock data during development.

### Giveaway

A giveaway contains information such as:

```text
id
title
status
startDate
endDate
prizes
participants
```

### Prize

Prize configuration contains information such as:

```text
id
name
position
image
description
winnerCount
prizeType
claimType
currency
fee
```

### Statistics

Development statistics include realistic fictional values such as:

```text
Total Giveaways: 24
Participants: 8,500+
Prizes Won: 1,200+
```

These values are development/demo data and are not presented as real VELOOP statistics.

---

## Future Backend Integration

The final architecture is designed around the principle that:

**Frontend = Presentation**  
**Backend = Authority**  
**Database = Source of Truth**  
**Transactions = Reward Integrity**  
**Fraud Layer = Abuse Prevention**  
**Audit Logs = Accountability**

The intended architecture is:

```text
VELOOP User
     ↓
Giveaway Frontend
     ↓
API Request
     ↓
Authentication
     ↓
Validation
     ↓
Fraud Protection
     ↓
Giveaway Service
     ↓
User Balance + Giveaway Database
     ↓
Database Transaction
     ↓
Deduct Currency + Create Entry
     ↓
Transaction / Audit Record
     ↓
Success Response
     ↓
Frontend UI Update
```

The backend should independently verify:

- Giveaway existence
- Giveaway status
- Start/end time
- Authentication
- User eligibility
- Existing participation
- Required currency
- Correct entry fee
- User balance
- Duplicate requests
- Suspicious activity
- Participation permissions

Client-side values must not be trusted for reward or financial operations.

---

## Security & Environment Variables

Sensitive configuration must never be committed to GitHub.

Use `.env` for sensitive configuration such as:

```text
MONGO_URI
JWT_SECRET
REFRESH_SECRET
CLIENT_URL
```

Only example configuration should be committed:

```text
.env.example
```

No MongoDB credentials, JWT secrets, admin credentials, or private API keys should be exposed to the frontend.

---

## Screenshots

Final documentation will include screenshots covering:

### Responsive Layouts

- Desktop
- Tablet
- Mobile

### Giveaway States

- Active Giveaway
- Ended Giveaway
- Upcoming Giveaway

### User / Winner States

- Winner Tab
- Previous Winners
- Winner Claim Modal
- Amazon Gift Card Claim Modal
- Non-Winner State

Screenshots will be added after the final implementation and deployment QA.

---

## Live Demo

**Deployment Platform:** Vercel

**Live URL:** Coming soon

The final deployed URL will be added here after Vercel deployment.

---

## Project Status

### Completed — Day 2

- Giveaway Hero / Banner
- Giveaway Statistics
- Featured Giveaways
- Prize Cards
- Giveaway Rules & Guidelines
- How It Works
- Countdown
- ACTIVE / UPCOMING / ENDED states
- Winner Announcement
- Current Winners
- Previous Winners
- Trust Section
- FAQ
- Final CTA
- Footer
- Individual Giveaway Details Page
- Responsive QA
- Accessibility QA
- Participation API contract foundation

### Backend Integration Pending

- Authentication integration
- MongoDB integration
- Backend-driven giveaway data
- Balance verification
- Atomic participation transaction
- Currency deduction
- Participation/entry creation
- Fraud protection integration
- Winner finalization
- Winner detection
- Prize claim processing
- Frontend/backend integration
- Final deployment QA

---

## Assignment Deliverables

The final project deliverables will include:

1. GitHub Repository
2. Live Website
3. Complete README Documentation
4. Screenshots
5. Backend/API Documentation

The final deployed system will be structured to support multiple giveaway events, multiple prizes, different currencies, different entry fees, winner limits, future reward types, and additional anti-abuse rules.

---

## License

This project was developed as part of the VELOOP Rewards internship assignment.
