import airpodsImage from "../assets/images/ChatGPT Image Aug 19, 2026, 02_06_07 PM.png";
import appleWatchImage from "../assets/images/ChatGPT Image Aug 19, 2026, 01_55_25 PM.png";
import amazon2000GiftCardImage from "../assets/images/ChatGPT Image Aug 19, 2026, 03_22_24 PM.png";
import iphone15ProImage from "../assets/images/ChatGPT Image Aug 19, 2026, 01_49_05 PM.png";
import voucher20Image from "../assets/images/ChatGPT Image Aug 19, 2026, 05_07_43 PM.png";

// Development-only prize configuration shaped like API response records.
export const PRIZE_TYPES = Object.freeze({
	PHYSICAL: "PHYSICAL",
	GIFT_CARD: "GIFT_CARD",
	DIGITAL: "DIGITAL",
});

export const CLAIM_TYPES = Object.freeze({
	PHYSICAL: "PHYSICAL",
	EMAIL: "EMAIL",
});

export const CURRENCIES = Object.freeze({
	VES: "VES",
	SVES: "SVES",
	TOKENS: "TOKENS",
});

export const IPHONE_15_PRO_PRIZE = Object.freeze({
	id: "PRIZE-IPHONE-15-PRO",
	name: "iPhone 15 Pro",
	position: 1,
	image: iphone15ProImage,
	description: "iPhone 15 Pro prize for one selected winner.",
	winnerCount: 1,
	prizeType: PRIZE_TYPES.PHYSICAL,
	claimType: CLAIM_TYPES.PHYSICAL,
	entryFee: { amount: 250, currency: CURRENCIES.VES },
});

export const APPLE_WATCH_PRIZE = Object.freeze({
	id: "PRIZE-APPLE-WATCH",
	name: "Apple Watch",
	position: 2,
	image: appleWatchImage,
	description: "Apple Watch prize for three selected winners.",
	winnerCount: 3,
	prizeType: PRIZE_TYPES.PHYSICAL,
	claimType: CLAIM_TYPES.PHYSICAL,
	entryFee: { amount: 200, currency: CURRENCIES.VES },
});

export const AIRPODS_PRIZE = Object.freeze({
	id: "PRIZE-AIRPODS",
	name: "AirPods",
	position: 3,
	image: airpodsImage,
	description: "AirPods prize for five selected winners.",
	winnerCount: 5,
	prizeType: PRIZE_TYPES.PHYSICAL,
	claimType: CLAIM_TYPES.PHYSICAL,
	entryFee: { amount: 500, currency: CURRENCIES.SVES },
});

export const AMAZON_2000_GIFT_CARD_PRIZE = Object.freeze({
	id: "PRIZE-AMAZON-2000",
	name: "₹2,000 Amazon Gift Card",
	position: 4,
	image: amazon2000GiftCardImage,
	description: "Amazon gift card prize for ten selected winners.",
	winnerCount: 10,
	prizeType: PRIZE_TYPES.GIFT_CARD,
	claimType: CLAIM_TYPES.EMAIL,
	entryFee: { amount: 500, currency: CURRENCIES.VES },
});

export const AMAZON_500_GIFT_CARD_PRIZE = Object.freeze({
	id: "PRIZE-AMAZON-500",
	name: "₹500 Amazon Gift Card",
	position: 5,
	image: null,
	description: "Amazon gift card prize for ten selected winners.",
	winnerCount: 10,
	prizeType: PRIZE_TYPES.GIFT_CARD,
	claimType: CLAIM_TYPES.EMAIL,
	entryFee: { amount: 300, currency: CURRENCIES.VES },
});

export const VOUCHER_20_PRIZE = Object.freeze({
	id: "PRIZE-VOUCHER-20",
	name: "₹20 Voucher",
	position: 6,
	image: voucher20Image,
	description: "Digital voucher prize for twenty selected winners.",
	winnerCount: 20,
	prizeType: PRIZE_TYPES.DIGITAL,
	claimType: CLAIM_TYPES.EMAIL,
	entryFee: { amount: 2000, currency: CURRENCIES.TOKENS },
});

export const PRIZES = Object.freeze([
	IPHONE_15_PRO_PRIZE,
	APPLE_WATCH_PRIZE,
	AIRPODS_PRIZE,
	AMAZON_2000_GIFT_CARD_PRIZE,
	AMAZON_500_GIFT_CARD_PRIZE,
	VOUCHER_20_PRIZE,
]);
