import { FiArrowRight, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import useCountdown from "../../hooks/useCountdown.js";
import styles from "./Countdown.module.css";

const GIVEAWAY_STATUS = Object.freeze({
	UPCOMING: "UPCOMING",
	ACTIVE: "ACTIVE",
	ENDED: "ENDED",
});

const timeUnits = [
	["days", "Days"],
	["hours", "Hours"],
	["minutes", "Minutes"],
	["seconds", "Seconds"],
];

function formatValue(value) {
	return String(value).padStart(2, "0");
}

export default function Countdown({ giveaway }) {
	const isUpcoming = giveaway.status === GIVEAWAY_STATUS.UPCOMING;
	const isInitiallyActive = giveaway.status === GIVEAWAY_STATUS.ACTIVE;
	const startAt = giveaway.startAt ?? giveaway.startDate;
	const endAt = giveaway.endAt ?? giveaway.endDate;
	const targetDate = isUpcoming ? startAt : isInitiallyActive ? endAt : null;
	const { timeLeft, isEnded } = useCountdown(targetDate);
	const isActive = isInitiallyActive && !isEnded;
	const effectiveStatus = isActive
		? GIVEAWAY_STATUS.ACTIVE
		: isUpcoming && !isEnded
			? GIVEAWAY_STATUS.UPCOMING
			: GIVEAWAY_STATUS.ENDED;

	const statusCopy = {
		[GIVEAWAY_STATUS.ACTIVE]: {
			label: "Live now",
			description: "There is still time to explore this giveaway and review its entry details.",
		},
		[GIVEAWAY_STATUS.UPCOMING]: {
			label: "Coming soon",
			description: "Participation will become available when this giveaway starts.",
		},
		[GIVEAWAY_STATUS.ENDED]: {
			label: "Giveaway ended",
			description: "This giveaway has ended. Winner information remains available for review.",
		},
	}[effectiveStatus];

	return (
		<section className={styles.section} aria-labelledby="giveaway-status-title">
			<div className={`${styles.container} container`}>
				<div className={styles.copy}>
					<p className={styles.eyebrow}><FiClock aria-hidden="true" /> Giveaway status</p>
					<h2 id="giveaway-status-title">{statusCopy.label}</h2>
					<p>{statusCopy.description}</p>
				</div>

				{effectiveStatus === GIVEAWAY_STATUS.ENDED ? (
					<div className={styles.endedPanel} role="status">
						<p>Thank you for your interest in {giveaway.title}.</p>
					</div>
				) : (
					<div className={styles.countdown} aria-label={`${statusCopy.label}. Time remaining`}>
						{timeUnits.map(([key, label]) => (
							<div className={styles.unit} key={key}>
								<strong>{formatValue(timeLeft[key])}</strong>
								<span>{label}</span>
							</div>
						))}
					</div>
				)}

				{isActive ? (
					<Link className={styles.cta} to={`/giveaway/${giveaway.id}`}>
						Explore Giveaway <FiArrowRight aria-hidden="true" />
					</Link>
				) : (
					<span className={styles.inactiveCta} aria-label={effectiveStatus === GIVEAWAY_STATUS.UPCOMING ? "Participation not available yet" : "Giveaway is no longer active"}>
						{effectiveStatus === GIVEAWAY_STATUS.UPCOMING ? "Participation opens soon" : "Participation closed"}
					</span>
				)}
			</div>
		</section>
	);
}
