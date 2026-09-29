import { FiAward, FiClock, FiGift, FiUsers } from "react-icons/fi";
import { giveawayStats } from "../../data/giveawayData.js";
import useCountdown from "../../hooks/useCountdown.js";
import styles from "./GiveawayStats.module.css";

export default function GiveawayStats({ giveaway }) {
	const targetDate = giveaway?.endAt ?? giveaway?.endDate;
	const { timeLeft, isEnded } = useCountdown(targetDate);
	const endsIn = isEnded
		? "Ended"
		: `${String(timeLeft.days).padStart(2, "0")}d : ${String(timeLeft.hours).padStart(2, "0")}h : ${String(timeLeft.minutes).padStart(2, "0")}m`;

	const statItems = [
		{ id: "total-giveaways", label: "Total Giveaways", value: giveawayStats.totalGiveaways, Icon: FiGift },
		{ id: "participants", label: "Participants", value: giveawayStats.participants, Icon: FiUsers },
		{ id: "prizes-won", label: "Prizes Won", value: giveawayStats.prizesWon, Icon: FiAward },
		{ id: "ends-in", label: "Ends In", value: endsIn, Icon: FiClock, countdown: true },
	];

	return (
		<section className={styles.section} aria-labelledby="giveaway-stats-title">
			<div className={`${styles.container} container`}>
				<h2 id="giveaway-stats-title" className={styles.srOnly}>
					Illustrative giveaway statistics
				</h2>
				<p className={styles.sampleNotice}>Example figures; not live platform totals.</p>
				<ul className={styles.list}>
					{statItems.map(({ id, label, value, Icon, countdown }) => (
						<li className={`${styles.stat} ${countdown ? styles.countdown : ""}`.trim()} key={id}>
							<div className={styles.icon} aria-hidden="true">
								<Icon />
							</div>
							<div>
								<p className={styles.value}>{value}</p>
								<p className={styles.label}>{label}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
