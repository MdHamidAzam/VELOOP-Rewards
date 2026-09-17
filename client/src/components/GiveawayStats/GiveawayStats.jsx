import { FiAward, FiGift, FiUsers } from "react-icons/fi";
import styles from "./GiveawayStats.module.css";

export default function GiveawayStats({ participantCount, statistics }) {
	const statItems = [
		{ id: "total-giveaways", label: "Total Giveaways", value: statistics?.totalGiveaways ?? "-", Icon: FiGift },
		{ id: "participants", label: "Participants", value: statistics?.participants ?? participantCount ?? "-", Icon: FiUsers },
		{ id: "prizes-won", label: "Prizes Won", value: statistics?.prizesWon ?? "-", Icon: FiAward },
	];

	return (
		<section className={styles.section} aria-labelledby="giveaway-stats-title">
			<div className={`${styles.container} container`}>
				<h2 id="giveaway-stats-title" className={styles.srOnly}>
					Giveaway statistics
				</h2>
				<ul className={styles.list}>
					{statItems.map(({ id, label, value, Icon }) => (
						<li className={styles.stat} key={id}>
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
