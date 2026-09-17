export const DEMO_GIVEAWAY_ID = "GW-2026-09";
export const DEMO_PREVIOUS_GIVEAWAY_ID = "GW-2026-08";

const prizeCatalog = Object.freeze([
  {
    id: "PRIZE-IPHONE-15-PRO",
    name: "iPhone 15 Pro",
    position: 1,
    image: null,
    description: "iPhone 15 Pro prize for one selected winner.",
    winnerCount: 1,
    prizeType: "PHYSICAL",
    claimType: "PHYSICAL",
    entryFee: { amount: 250, currency: "VES" },
  },
  {
    id: "PRIZE-APPLE-WATCH",
    name: "Apple Watch",
    position: 2,
    image: null,
    description: "Apple Watch prize for three selected winners.",
    winnerCount: 3,
    prizeType: "PHYSICAL",
    claimType: "PHYSICAL",
    entryFee: { amount: 200, currency: "VES" },
  },
  {
    id: "PRIZE-AIRPODS",
    name: "AirPods",
    position: 3,
    image: null,
    description: "AirPods prize for five selected winners.",
    winnerCount: 5,
    prizeType: "PHYSICAL",
    claimType: "PHYSICAL",
    entryFee: { amount: 500, currency: "SVES" },
  },
  {
    id: "PRIZE-AMAZON-2000",
    name: "₹2,000 Amazon Gift Card",
    position: 4,
    image: null,
    description: "Amazon gift card prize for ten selected winners.",
    winnerCount: 10,
    prizeType: "GIFT_CARD",
    claimType: "EMAIL",
    entryFee: { amount: 500, currency: "VES" },
  },
  {
    id: "PRIZE-AMAZON-500",
    name: "₹500 Amazon Gift Card",
    position: 5,
    image: null,
    description: "Amazon gift card prize for ten selected winners.",
    winnerCount: 10,
    prizeType: "GIFT_CARD",
    claimType: "EMAIL",
    entryFee: { amount: 300, currency: "VES" },
  },
  {
    id: "PRIZE-VOUCHER-20",
    name: "₹20 Voucher",
    position: 6,
    image: null,
    description: "Digital voucher prize for twenty selected winners.",
    winnerCount: 20,
    prizeType: "DIGITAL",
    claimType: "EMAIL",
    entryFee: { amount: 2000, currency: "TOKENS" },
  },
});

const activeGiveaway = Object.freeze({
  id: DEMO_GIVEAWAY_ID,
  title: "September 2026 Giveaway",
  slug: "september-2026-giveaway",
  status: "ACTIVE",
  startAt: "2026-09-01T00:00:00.000Z",
  endAt: "2026-09-30T23:59:59.000Z",
  description: "Development demo giveaway record for the September 2026 event.",
  rules: [
    "One participation per user and giveaway.",
    "The configured entry fee is deducted by the backend in production.",
    "Development demo data is for local UI validation only.",
  ],
  eligibility: { minAge: 18, countries: [], requiresVerifiedUser: false },
  participationSettings: { maxParticipationsPerUser: 1 },
  prizes: prizeCatalog.map((prize) => ({ ...prize, status: "AVAILABLE" })),
  participantCount: 1842,
  statistics: { totalGiveaways: 24, participants: 1842, prizesWon: 1200 },
  winners: [],
});

const previousGiveaway = Object.freeze({
  id: DEMO_PREVIOUS_GIVEAWAY_ID,
  title: "August 2026 Giveaway",
  slug: "august-2026-giveaway",
  status: "ARCHIVED",
  startAt: "2026-08-01T00:00:00.000Z",
  endAt: "2026-08-31T23:59:59.000Z",
  winnersFinalizedAt: "2026-08-31T23:59:59.000Z",
  description: "Completed development demo giveaway record for August 2026.",
  rules: activeGiveaway.rules,
  eligibility: activeGiveaway.eligibility,
  participationSettings: activeGiveaway.participationSettings,
  prizes: prizeCatalog.map((prize) => ({ ...prize, id: `${prize.id}-GW-2026-08`, status: "AWARDED" })),
  participantCount: 1620,
  statistics: { totalGiveaways: 24, participants: 1620, prizesWon: 1 },
  winners: [
    {
      id: "demo-winner-aug-watch",
      prizeId: "PRIZE-APPLE-WATCH-GW-2026-08",
      prizeName: "Apple Watch",
      prizeImage: null,
      maskedId: "VE****25",
      status: "SELECTED",
      selectedAt: "2026-08-31T23:59:59.000Z",
    },
    {
      id: "demo-winner-aug-gift-card",
      prizeId: "PRIZE-AMAZON-2000-GW-2026-08",
      prizeName: "₹2,000 Amazon Gift Card",
      prizeImage: null,
      maskedId: "VE****28",
      status: "SELECTED",
      selectedAt: "2026-08-31T23:59:59.000Z",
    },
  ],
});

const DEMO_WALLETS = Object.freeze({
  VE10025: { userId: "VE10025", currency: "VES", balance: 850 },
  VE10026: { userId: "VE10026", currency: "VES", balance: 850 },
  VE10027: { userId: "VE10027", currency: "VES", balance: 850 },
  VE10028: { userId: "VE10028", currency: "VES", balance: 850 },
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toKey(userId, giveawayId) {
  const normalizedUserId = String(userId ?? '').trim();
  const normalizedGiveawayId = String(giveawayId ?? '').trim();
  return normalizedUserId && normalizedGiveawayId ? `${normalizedUserId}:${normalizedGiveawayId}` : null;
}

export function getDemoCurrentGiveaway() {
  return clone(activeGiveaway);
}

export function getDemoGiveawayById(giveawayId) {
  if (giveawayId === activeGiveaway.id) return clone(activeGiveaway);
  if (giveawayId === previousGiveaway.id) return clone(previousGiveaway);
  return null;
}

export function getDemoPreviousGiveaways() {
  return [clone(previousGiveaway)];
}

export function getDemoPreviousWinners() {
  return [{
    giveaway: {
      id: previousGiveaway.id,
      title: previousGiveaway.title,
      status: previousGiveaway.status,
      endAt: previousGiveaway.endAt,
      winnersFinalizedAt: previousGiveaway.winnersFinalizedAt,
    },
    winners: clone(previousGiveaway.winners),
  }];
}

export function getDemoWalletForUser(userId, currency = 'VES') {
  const normalizedUserId = String(userId ?? '').trim();
  const wallet = DEMO_WALLETS[normalizedUserId] ?? { userId: normalizedUserId || 'demo-user', currency: 'VES', balance: 850 };
  const normalizedCurrency = String(currency ?? wallet.currency).trim().toUpperCase();
  if (normalizedCurrency === 'VES' || normalizedCurrency === 'SVES' || normalizedCurrency === 'TOKENS') {
    const baseBalance = wallet.balance;
    return {
      userId: wallet.userId,
      currency: normalizedCurrency,
      balance: baseBalance,
    };
  }
  return { userId: wallet.userId, currency: wallet.currency, balance: wallet.balance };
}

export function getDemoGiveawayStatus(userId, giveawayId) {
  const normalizedUserId = String(userId ?? '').trim();
  const key = toKey(normalizedUserId, giveawayId);
  const participationMap = JSON.parse(globalThis.sessionStorage?.getItem('veloop.demo.participations') ?? '{}');
  const claimsMap = JSON.parse(globalThis.sessionStorage?.getItem('veloop.demo.claims') ?? '{}');
  const isParticipant = Boolean(participationMap[key]);
  const isWinner = giveawayId === previousGiveaway.id && previousGiveaway.winners.some((winner) => winner.maskedId === `VE****${normalizedUserId.slice(-2)}`);
  const winnerRecord = isWinner ? {
    id: 'demo-winner-id',
    maskedId: `VE****${normalizedUserId.slice(-2)}`,
    prizeId: previousGiveaway.winners[0].prizeId,
    prizeName: previousGiveaway.winners[0].prizeName,
    claimType: previousGiveaway.winners[0].prizeName.includes('Amazon') ? 'EMAIL' : 'PHYSICAL',
    selectedAt: previousGiveaway.winners[0].selectedAt,
    claimDeadline: '2026-09-07T23:59:59.000Z',
  } : null;

  const claim = claimsMap[key] ?? null;
  return {
    giveawayId,
    participating: isParticipant || Boolean(winnerRecord),
    entries: isParticipant || winnerRecord ? 1 : 0,
    winner: winnerRecord,
    claim,
  };
}

export function createDemoParticipation(userId, giveawayId, prizeId) {
  const normalizedUserId = String(userId ?? '').trim();
  const key = toKey(normalizedUserId, giveawayId);
  if (!key) {
    throw new Error('A valid user and giveaway are required.');
  }
  const participationMap = JSON.parse(globalThis.sessionStorage?.getItem('veloop.demo.participations') ?? '{}');
  if (participationMap[key]) {
    const existing = participationMap[key];
    return {
      giveawayId,
      prizeId: existing.prizeId ?? prizeId,
      entryId: existing.entryId ?? `demo-entry-${key}`,
      idempotent: true,
    };
  }
  const record = {
    prizeId,
    entryId: `demo-entry-${key}`,
    createdAt: new Date().toISOString(),
  };
  participationMap[key] = record;
  globalThis.sessionStorage?.setItem('veloop.demo.participations', JSON.stringify(participationMap));
  return { giveawayId, prizeId, entryId: record.entryId };
}

export function submitDemoClaim(userId, giveawayId, claimData) {
  const normalizedUserId = String(userId ?? '').trim();
  const key = toKey(normalizedUserId, giveawayId);
  if (!key) {
    throw new Error('A valid user and giveaway are required.');
  }
  const claimsMap = JSON.parse(globalThis.sessionStorage?.getItem('veloop.demo.claims') ?? '{}');
  if (claimsMap[key]) {
    throw new Error('A claim has already been submitted for this prize.');
  }
  const claim = {
    id: `demo-claim-${key}`,
    giveawayId,
    prizeId: 'PRIZE-APPLE-WATCH-GW-2026-08',
    claimType: 'PHYSICAL',
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    expiresAt: '2026-09-07T23:59:59.000Z',
    claimData,
  };
  claimsMap[key] = claim;
  globalThis.sessionStorage?.setItem('veloop.demo.claims', JSON.stringify(claimsMap));
  return claim;
}
