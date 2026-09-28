import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import Countdown from "../../components/Countdown/Countdown.jsx";
import FAQ from "../../components/FAQ/FAQ.jsx";
import GiveawayRules from "../../components/GiveawayRules/GiveawayRules.jsx";
import HowToParticipate from "../../components/HowToParticipate/HowToParticipate.jsx";
import PrizeCard from "../../components/PrizeCard/PrizeCard.jsx";
import TrustSection from "../../components/TrustSection/TrustSection.jsx";
import ParticipationModal from "../../components/ParticipationModal/ParticipationModal.jsx";
import PrizeClaimModal from "../../components/PrizeClaimModal/PrizeClaimModal.jsx";
import WinnerCard from "../../components/WinnerCard/WinnerCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useGiveawayStatus } from "../../hooks/useGiveawayStatus.js";
import { useGiveawayDetails } from "../../hooks/useGiveawayDetails.js";
import { useWallet } from "../../hooks/useWallet.js";
import { participateInGiveaway } from "../../services/participationApi.js";
import { submitPrizeClaim } from "../../services/claimApi.js";
import { mapCurrentGiveaway } from "../../utils/giveawayViewModel.js";
import styles from "./GiveawayDetails.module.css";

const GIVEAWAY_STATUS = Object.freeze({
	UPCOMING: "UPCOMING",
	ACTIVE: "ACTIVE",
	ENDED: "ENDED",
	ARCHIVED: "ARCHIVED",
});

function formatDate(date) {
	if (!date || Number.isNaN(new Date(date).getTime())) return "Date unavailable";

	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(date));
}

function getStatusLabel(status) {
	return typeof status === "string" ? status.charAt(0) + status.slice(1).toLowerCase() : "Unavailable";
}

function getParticipationErrorMessage(error, currency) {
	if (error?.status === 401 || error?.code === "AUTHENTICATION_REQUIRED") return "Please log in to participate in this giveaway.";
	if (error?.status === 404 || error?.code === "GIVEAWAY_NOT_FOUND") return "This giveaway is no longer available.";
	if (error?.status === 409 || error?.code === "DUPLICATE_PARTICIPATION") return "You're already participating in this giveaway.";
	if (error?.status === 429 || error?.code === "RATE_LIMITED") return "Too many attempts. Please wait a moment and try again.";
	if (error?.code === "GIVEAWAY_NOT_ACTIVE" || error?.code === "GIVEAWAY_ENDED") return "This giveaway has ended.";
	if (error?.code === "CURRENCY_MISMATCH") return "Your wallet currency does not match this prize.";
	if (error?.code === "INSUFFICIENT_BALANCE") return `Not enough ${currency ?? "wallet"} to join this giveaway.`;
	return "We couldn't complete your participation. Please try again.";
}

function DetailsState({ type, error, onRetry }) {
	const notFound = type === "not-found";
	return (
		<main className={styles.notFound}>
			<div className={`${styles.notFoundCard} container`}>
				<p className={styles.eyebrow}>{notFound ? "Giveaway not found" : type === "loading" ? "Loading giveaway" : "Unable to load giveaway"}</p>
				<h1>{notFound ? "That giveaway is not available." : type === "loading" ? "Loading giveaway details..." : "We could not load this giveaway."}</h1>
				<p>{notFound ? "We could not find a giveaway matching this link. Return to the available giveaways to continue exploring." : type === "loading" ? "The latest giveaway details are being retrieved." : "Please try again or return to the available giveaways."}</p>
				<div className={styles.stateActions}>
					{!notFound && type !== "loading" && <button className={styles.primaryButton} type="button" onClick={onRetry}>Try again</button>}
					{type !== "loading" && <Link className={styles.primaryLink} to="/"><FiArrowLeft aria-hidden="true" /> Back to Giveaways</Link>}
				</div>
			</div>
		</main>
	);
}

export default function GiveawayDetails() {
	const { giveawayId } = useParams();
	const [selectedPrizeId, setSelectedPrizeId] = useState("");
	const [joinError, setJoinError] = useState(null);
	const [joinState, setJoinState] = useState("idle");
	const [success, setSuccess] = useState(null);
	const [claimModalOpen, setClaimModalOpen] = useState(false);
	const [claimSubmitting, setClaimSubmitting] = useState(false);
	const [claimError, setClaimError] = useState(null);
	const { data, loading, error, reload } = useGiveawayDetails(giveawayId);
	const { isAuthenticated } = useAuth();
	const userStatus = useGiveawayStatus(giveawayId, isAuthenticated);
	const wallet = useWallet({ autoLoad: false });
	const giveaway = mapCurrentGiveaway(data);

	useEffect(() => {
		setSelectedPrizeId(giveaway?.prizes?.[0]?.id ?? "");
		setJoinError(null);
		setSuccess(null);
		setJoinState("idle");
	}, [giveaway?.id]);

	if (loading) return <DetailsState type="loading" />;
	if (error?.status === 404) return <DetailsState type="not-found" error={error} onRetry={reload} />;
	if (error) return <DetailsState type="error" error={error} onRetry={reload} />;
	if (!giveaway?.id || !giveaway.title || !Array.isArray(giveaway.prizes)) return <DetailsState type="error" onRetry={reload} />;

	const isActive = giveaway.status === GIVEAWAY_STATUS.ACTIVE;
	const isUpcoming = giveaway.status === GIVEAWAY_STATUS.UPCOMING;
	const isEnded = giveaway.status === GIVEAWAY_STATUS.ENDED || giveaway.status === GIVEAWAY_STATUS.ARCHIVED;
	const participationLabel = !isActive
		? isUpcoming
			? "Notify Me"
			: "Participation closed"
		: userStatus.data?.participating
			? "You're Participating"
			: "Continue to participation";
	const eligibility = giveaway.eligibility && typeof giveaway.eligibility === "object" ? giveaway.eligibility : {};
	const participationSettings = giveaway.participationSettings && typeof giveaway.participationSettings === "object" ? giveaway.participationSettings : {};
	const hasConfiguredDetails = Object.keys(eligibility).length > 0 || Object.keys(participationSettings).length > 0 || (Array.isArray(giveaway.rules) && giveaway.rules.length > 0);
	const selectedPrize = giveaway.prizes.find(({ id }) => id === selectedPrizeId) ?? null;
	const selectedPrizeAvailable = selectedPrize?.status === "AVAILABLE";

	const handleJoin = async () => {
		setJoinError(null);
		if (!isAuthenticated) {
			setJoinError({ type: "login", message: "Please log in to participate in this giveaway." });
			return;
		}
		if (!isActive || !selectedPrize) return;
		if (!isActive || !selectedPrize || !selectedPrizeAvailable) return;

		setJoinState("checking");
		try {
			const amount = selectedPrize.entryFee?.amount;
			const currency = selectedPrize.entryFee?.currency;
			const currentWallet = await wallet.reload(currency);
			if (!currentWallet || !Number.isFinite(amount) || !currency) {
				setJoinError({ message: "The entry fee or wallet information is unavailable." });
				setJoinState("idle");
				return;
			}
			if (currentWallet.currency !== currency) {
				setJoinError({ message: "Your wallet currency does not match this prize." });
				setJoinState("idle");
				return;
			}
			if (currentWallet.balance < amount) {
				setJoinError({ message: `Not enough ${currency} to join this giveaway. You need ${(amount - currentWallet.balance).toLocaleString()} more ${currency}.`, insufficient: true });
				setJoinState("idle");
				return;
			}
			setJoinState("confirming");
		} catch (walletError) {
			setJoinError({ message: getParticipationErrorMessage(walletError, selectedPrize.entryFee?.currency) });
			setJoinState("idle");
		}
	};

	const handleConfirm = async () => {
		if (joinState === "submitting" || !selectedPrize) return;
		setJoinState("submitting");
		setJoinError(null);
		try {
			await participateInGiveaway(giveaway.id, selectedPrize.id);
			await userStatus.reload();
			setJoinState("success");
			setSuccess({ prizeName: selectedPrize.name, entryFee: selectedPrize.entryFee });
			void wallet.reload().catch(() => undefined);
			void reload().catch(() => undefined);
		} catch (participationError) {
			setJoinState("confirming");
			setJoinError({ message: getParticipationErrorMessage(participationError, selectedPrize.entryFee?.currency) });
			if (participationError?.code === "INSUFFICIENT_BALANCE") void wallet.reload().catch(() => undefined);
		}
	};

	const handleClaimSubmit = async (claimData) => {
		setClaimSubmitting(true);
		setClaimError(null);
		try {
			await submitPrizeClaim(giveaway.id, claimData);
			await userStatus.reload();
		} catch (error) {
			setClaimError(error?.message ?? "The claim could not be submitted. Please try again.");
		} finally {
			setClaimSubmitting(false);
		}
	};

	return (
		<main className={styles.page}>
			<div className={`${styles.container} container`}>
				<nav className={styles.breadcrumbs} aria-label="Breadcrumb">
					<Link to="/">Giveaways</Link>
					<span aria-hidden="true">/</span>
					<span aria-current="page">{giveaway.title}</span>
				</nav>

				<header className={styles.header}>
					<div className={styles.headerCopy}>
						<p className={styles.statusBadge}>{getStatusLabel(giveaway.status)}</p>
						<h1>{giveaway.title}</h1>
						<p className={styles.description}>{giveaway.description}</p>
						<div className={styles.dateRow}>
							<span>Starts {formatDate(giveaway.startAt ?? giveaway.startDate)} UTC</span>
							<span>Ends {formatDate(giveaway.endAt ?? giveaway.endDate)} UTC</span>
						</div>
					</div>
					<div className={styles.headerAside}>
						<FiCheckCircle aria-hidden="true" />
						<span>Reward details</span>
						<strong>{giveaway.prizes.length} prizes available</strong>
					</div>
				</header>
			</div>

			<Countdown giveaway={giveaway} />

			<div className={`${styles.container} container`}>
				<section className={styles.section} aria-labelledby="prize-overview-title">
					<div className={styles.sectionHeading}>
						<p className={styles.eyebrow}>Reward overview</p>
						<h2 id="prize-overview-title">Prizes in this giveaway</h2>
						<p>Review each reward, winner count, and entry requirement before participating.</p>
					</div>
					{giveaway.prizes.length > 0 ? (
						<div className={styles.prizeGrid}>
							{giveaway.prizes.map((prize) => (
								<PrizeCard key={prize.id} prize={prize} giveawayId={giveaway.id} giveawayStatus={giveaway.status} />
							))}
						</div>
					) : <p className={styles.unavailable}>No prize information is available for this giveaway.</p>}
				</section>

				{giveaway.status === "ENDED" && giveaway.winners.length > 0 && (
					<section className={styles.section} aria-labelledby="winner-information-title">
						<div className={styles.sectionHeading}>
							<p className={styles.eyebrow}>Giveaway results</p>
							<h2 id="winner-information-title">Winner Information</h2>
							<p>The winners selected for this ended giveaway are published below.</p>
						</div>
						<div className={styles.prizeGrid}>
							{giveaway.winners.map((winner) => (
								<WinnerCard key={winner.id} winner={winner} giveaway={giveaway} prize={giveaway.prizes.find(({ id }) => id === winner.prizeId)} />
							))}
						</div>
						<Link className={styles.loginLink} to="/#previous-winners">View Winners</Link>
					</section>
				)}

				{isEnded && isAuthenticated && userStatus.data?.winner && (
					<section className={styles.participation} aria-labelledby="winner-claim-title">
						<div>
							<p className={styles.eyebrow}>Winner verified</p>
							<h2 id="winner-claim-title">Congratulations, you won {userStatus.data.winner.prizeName}.</h2>
							<p>Your winner status was verified by the backend. Submit the required details before the claim deadline.</p>
						</div>
						<div className={styles.participationAction}>
							<button className={styles.primaryButton} type="button" onClick={() => { setClaimError(null); setClaimModalOpen(true); }}>
								{userStatus.data.claim ? "View claim status" : "Claim your prize"}
								<FiArrowRight aria-hidden="true" />
							</button>
							{userStatus.data.claim && <p className={styles.notice} role="status">Claim status: {userStatus.data.claim.status}</p>}
						</div>
					</section>
				)}

				{isEnded && isAuthenticated && userStatus.data && !userStatus.data.winner && (
					<section className={styles.participation} aria-labelledby="non-winner-title">
						<div><p className={styles.eyebrow}>Giveaway results</p><h2 id="non-winner-title">Thanks for participating.</h2><p>Winners have been announced. Keep participating for the next giveaway.</p></div>
					</section>
				)}

				<section className={styles.participation} aria-labelledby="participation-title">
					<div>
						<p className={styles.eyebrow}>Before you enter</p>
						<h2 id="participation-title">Eligibility &amp; participation</h2>
						<p>Review the configured giveaway details and choose the entry requirement for the reward you want. Your participation is verified and recorded by the VELOOP backend.</p>
						{hasConfiguredDetails && (
							<div className={styles.configuration}>
								{Array.isArray(giveaway.rules) && giveaway.rules.length > 0 && <div><strong>Giveaway rules</strong><ul>{giveaway.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>}
								{Object.keys(eligibility).length > 0 && <div><strong>Eligibility</strong><p>{eligibility.minAge ? `Minimum age: ${eligibility.minAge}. ` : ""}{eligibility.countries?.length ? `Countries: ${eligibility.countries.join(", ")}. ` : ""}{eligibility.requiresVerifiedUser ? "Verified account required." : ""}</p></div>}
								{participationSettings.maxParticipationsPerUser && <div><strong>Participation limit</strong><p>{participationSettings.maxParticipationsPerUser} participation{participationSettings.maxParticipationsPerUser === 1 ? "" : "s"} per user.</p></div>}
							</div>
						)}
						{giveaway.prizes.length > 0 && (
							<label className={styles.prizeSelection}>
								<span>Select a prize to join</span>
								<select value={selectedPrizeId} onChange={(event) => setSelectedPrizeId(event.target.value)} disabled={!isActive || joinState === "submitting"}>
									{giveaway.prizes.map((prize) => <option key={prize.id} value={prize.id} disabled={prize.status !== "AVAILABLE"}>{prize.name}{prize.status !== "AVAILABLE" ? " (Unavailable)" : ""}</option>)}
								</select>
							</label>
						)}
					</div>
					<div className={styles.participationAction}>
						{success ? (
							<div className={styles.success} role="status">
								<strong>You're In!</strong>
								<span>Your participation for {success.prizeName} has been successfully recorded.</span>
								<span>Entry Fee: {success.entryFee?.amount?.toLocaleString() ?? "Unavailable"} {success.entryFee?.currency ?? ""}</span>
							</div>
						) : (
							<button className={styles.primaryButton} type="button" disabled={!isActive || Boolean(userStatus.data?.participating) || !selectedPrizeAvailable || joinState === "checking"} onClick={handleJoin}>
								{joinState === "checking" ? "Checking balance..." : isActive && !isAuthenticated ? "Login Required" : participationLabel}
								{isActive && joinState !== "checking" && <FiArrowRight aria-hidden="true" />}
							</button>
						)}
						{joinError && <p className={joinError.insufficient ? styles.insufficient : styles.notice} role="alert">{joinError.message}</p>}
						{joinError?.type === "login" && <>
							<Link className={styles.loginLink} to="/login">Log in</Link>
							<Link className={styles.loginLink} to="/register">Create an account</Link>
						</>}
					</div>
				</section>
			</div>

			<HowToParticipate />
			<GiveawayRules />
			<FAQ />
			<TrustSection />
			{joinState === "confirming" && selectedPrize && wallet.data && <ParticipationModal prize={selectedPrize} wallet={wallet.data} loading={false} error={joinError?.message} onCancel={() => { setJoinState("idle"); setJoinError(null); }} onConfirm={handleConfirm} />}
			{joinState === "submitting" && selectedPrize && wallet.data && <ParticipationModal prize={selectedPrize} wallet={wallet.data} loading error={null} onCancel={() => undefined} onConfirm={handleConfirm} />}
			{isEnded && isAuthenticated && claimModalOpen && userStatus.data?.winner && <PrizeClaimModal winner={userStatus.data.winner} claim={userStatus.data.claim} loading={claimSubmitting} error={claimError} onCancel={() => setClaimModalOpen(false)} onSubmit={handleClaimSubmit} />}
		</main>
	);
}
