import Wallet from "../models/Wallet.js";

export const SUPPORTED_CURRENCIES = Object.freeze(["VES", "SVES", "TOKENS"]);

export class WalletServiceError extends Error {
	constructor(message, { code, statusCode }) {
		super(message);
		this.name = "WalletServiceError";
		this.code = code;
		this.statusCode = statusCode;
	}
}

export function normalizeCurrency(currency) {
	if (typeof currency !== "string") {
		throw new WalletServiceError("A supported currency is required.", {
			code: "CURRENCY_INVALID",
			statusCode: 400,
		});
	}

	const normalizedCurrency = currency.trim().toUpperCase();
	if (!SUPPORTED_CURRENCIES.includes(normalizedCurrency)) {
		throw new WalletServiceError("The requested currency is not supported.", {
			code: "CURRENCY_INVALID",
			statusCode: 422,
		});
	}

	return normalizedCurrency;
}

export function validatePositiveAmount(amount) {
	if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
		throw new WalletServiceError("Amount must be a positive finite number.", {
			code: "AMOUNT_INVALID",
			statusCode: 422,
		});
	}

	return amount;
}

function validateUserId(userId) {
	if (typeof userId !== "string" || !userId.trim()) {
		throw new WalletServiceError("Authenticated user identity is required.", {
			code: "AUTHENTICATION_REQUIRED",
			statusCode: 401,
		});
	}

	return userId.trim();
}

export async function getWalletForUser(userId, currency) {
	const authenticatedUserId = validateUserId(userId);
	if (currency === undefined) {
		const wallets = await Wallet.find({ userId: authenticatedUserId, status: { $ne: "CLOSED" } })
			.sort({ currency: 1 })
			.lean();

		if (wallets.length === 0) {
			throw new WalletServiceError("Wallet not found.", {
				code: "WALLET_NOT_FOUND",
				statusCode: 404,
			});
		}
		if (wallets.length > 1) {
			throw new WalletServiceError("Currency is required when the user has multiple wallets.", {
				code: "CURRENCY_REQUIRED",
				statusCode: 400,
			});
		}

		return wallets[0];
	}

	const normalizedCurrency = normalizeCurrency(currency);
	const wallet = await Wallet.findOne({
		userId: authenticatedUserId,
		currency: normalizedCurrency,
		status: { $ne: "CLOSED" },
	}).lean();
	if (wallet) return wallet;

	const hasWallet = await Wallet.exists({ userId: authenticatedUserId });
	throw new WalletServiceError(hasWallet ? "Currency does not match an available user wallet." : "Wallet not found.", {
		code: hasWallet ? "CURRENCY_MISMATCH" : "WALLET_NOT_FOUND",
		statusCode: hasWallet ? 422 : 404,
	});
}

export async function getAuthoritativeBalance(userId, currency) {
	const wallet = await getWalletForUser(userId, currency);
	return {
		userId: wallet.userId,
		currency: wallet.currency,
		balance: wallet.balance,
	};
}

export async function assertSufficientBalance(userId, currency, amount) {
	const validatedAmount = validatePositiveAmount(amount);
	const wallet = await getWalletForUser(userId, currency);
	if (wallet.balance < validatedAmount) {
		throw new WalletServiceError("Insufficient wallet balance.", {
			code: "INSUFFICIENT_BALANCE",
			statusCode: 422,
		});
	}

	return {
		userId: wallet.userId,
		currency: wallet.currency,
		balance: wallet.balance,
	};
}

export async function deductWalletAtomically({ userId, currency, amount, session }) {
	const authenticatedUserId = validateUserId(userId);
	const normalizedCurrency = normalizeCurrency(currency);
	const validatedAmount = validatePositiveAmount(amount);

	const wallet = await Wallet.findOne({
		userId: authenticatedUserId,
		currency: normalizedCurrency,
		status: "ACTIVE",
	})
		.session(session)
		.lean();
	if (!wallet) {
		const hasWallet = await Wallet.exists({ userId: authenticatedUserId }).session(session);
		throw new WalletServiceError(hasWallet ? "Currency does not match an active user wallet." : "Wallet not found.", {
			code: hasWallet ? "CURRENCY_MISMATCH" : "WALLET_NOT_FOUND",
			statusCode: 422,
		});
	}

	const updatedWallet = await Wallet.findOneAndUpdate(
		{
			_id: wallet._id,
			status: "ACTIVE",
			balance: { $gte: validatedAmount },
		},
		{ $inc: { balance: -validatedAmount } },
		{ new: true, runValidators: true, session },
	).lean();

	if (!updatedWallet) {
		throw new WalletServiceError("Insufficient wallet balance or concurrent balance conflict.", {
			code: "INSUFFICIENT_BALANCE",
			statusCode: 422,
		});
	}

	return {
		userId: updatedWallet.userId,
		currency: updatedWallet.currency,
		balanceBefore: wallet.balance,
		balanceAfter: updatedWallet.balance,
	};
}
