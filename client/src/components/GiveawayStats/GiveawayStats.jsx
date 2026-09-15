import { FiAward, FiGift, FiUsers } from "react-icons/fi";
import { giveawayStats } from "../../data/giveawayData.js";
import styles from "./GiveawayStats.module.css";

const statistics = [
	{
		id: "total-giveaways",
		label: "Total Giveaways",
		value: giveawayStats.totalGiveaways,
		Icon: FiGift,
	},
	{
		id: "participants",
		label: "Participants",
		value: giveawayStats.participants,
		Icon: FiUsers,
	},
	{
		id: "prizes-won",
		label: "Prizes Won",
		value: giveawayStats.prizesWon,
		Icon: FiAward,
	},
];

export default function GiveawayStats() {
	return (
		<section className={styles.section} aria-labelledby="giveaway-stats-title">
			<div className={`${styles.container} container`}>
				<h2 id="giveaway-stats-title" className={styles.srOnly}>
					Giveaway statistics
				</h2>
				<ul className={styles.list}>
					{statistics.map(({ id, label, value, Icon }) => (
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
