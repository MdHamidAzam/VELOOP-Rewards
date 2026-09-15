import { useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiInfo } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { GIVEAWAYS, GIVEAWAY_STATUS } from "../../data/giveawayData.js";
import Countdown from "../../components/Countdown/Countdown.jsx";
import FAQ from "../../components/FAQ/FAQ.jsx";
import GiveawayRules from "../../components/GiveawayRules/GiveawayRules.jsx";
import HowToParticipate from "../../components/HowToParticipate/HowToParticipate.jsx";
import PrizeCard from "../../components/PrizeCard/PrizeCard.jsx";
import TrustSection from "../../components/TrustSection/TrustSection.jsx";
import styles from "./GiveawayDetails.module.css";

function formatDate(date) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(date));
}

function getStatusLabel(status) {
	return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function GiveawayDetails() {
	const { giveawayId } = useParams();
	const [showParticipationNotice, setShowParticipationNotice] = useState(false);
	const giveaway = GIVEAWAYS.find(({ id }) => id === giveawayId);

	if (!giveaway) {
		return (
			<main className={styles.notFound}>
				<div className={`${styles.notFoundCard} container`}>
					<p className={styles.eyebrow}>Giveaway not found</p>
					<h1>That giveaway is not available.</h1>
					<p>We could not find a giveaway matching this link. Return to the available giveaways to continue exploring.</p>
					<Link className={styles.primaryLink} to="/">
						<FiArrowLeft aria-hidden="true" /> Back to Giveaways
					</Link>
				</div>
			</main>
		);
	}

	const isActive = giveaway.status === GIVEAWAY_STATUS.ACTIVE;
	const isUpcoming = giveaway.status === GIVEAWAY_STATUS.UPCOMING;
	const participationLabel = isActive
		? "Continue to participation"
		: isUpcoming
			? "Participation opens soon"
			: "Participation closed";

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
							<span>Starts {formatDate(giveaway.startDate)}</span>
							<span>Ends {formatDate(giveaway.endDate)}</span>
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
					<div className={styles.prizeGrid}>
						{giveaway.prizes.map((prize) => (
							<PrizeCard key={prize.id} prize={prize} giveawayId={giveaway.id} />
						))}
					</div>
				</section>

				<section className={styles.participation} aria-labelledby="participation-title">
					<div>
						<p className={styles.eyebrow}>Before you enter</p>
						<h2 id="participation-title">Eligibility &amp; participation</h2>
						<p>Review the rules and choose the entry requirement for the reward you want. The participation flow is frontend-only until the backend is connected.</p>
					</div>
					<div className={styles.participationAction}>
						<button className={styles.primaryButton} type="button" disabled={!isActive} onClick={() => setShowParticipationNotice(true)}>
							{participationLabel}
							{isActive && <FiArrowRight aria-hidden="true" />}
						</button>
						{showParticipationNotice && isActive && (
							<p className={styles.notice} role="status"><FiInfo aria-hidden="true" /> Participation will be connected in a later step.</p>
						)}
					</div>
				</section>
			</div>

			<HowToParticipate />
			<GiveawayRules />
			<FAQ />
			<TrustSection />
		</main>
	);
}
