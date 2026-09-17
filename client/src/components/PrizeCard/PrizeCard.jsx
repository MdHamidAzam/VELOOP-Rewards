import { FiArrowUpRight, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./PrizeCard.module.css";

const currencyLabels = {
	VES: "VEs",
	SVES: "SVEs",
	TOKENS: "Tokens",
};

export default function PrizeCard({ prize, giveawayId }) {
	const amount = prize.entryFee?.amount;
	const currency = prize.entryFee?.currency;

	return (
		<article className={styles.card}>
			<div className={styles.imageArea}>
				<span className={styles.position}>Prize {prize.position}</span>
				{prize.image ? (
					<img className={styles.image} src={prize.image} alt={`${prize.name} prize`} />
				) : (
					<span className={styles.imageUnavailable}>Prize image coming soon</span>
				)}
			</div>

			<div className={styles.content}>
				<h3 className={styles.name}>{prize.name}</h3>
				<p className={styles.description}>{prize.description}</p>

				<div className={styles.meta}>
					<span className={styles.winners}>
						<FiUsers aria-hidden="true" />
						{prize.winnerCount} {prize.winnerCount === 1 ? "winner" : "winners"}
					</span>
					<span className={styles.entry}>
						{amount == null ? "-" : `${amount.toLocaleString()} ${currencyLabels[currency] ?? currency ?? ""}`}
					</span>
				</div>

				<Link className={styles.cta} to={`/giveaway/${giveawayId}`}>
					View Giveaway
					<FiArrowUpRight aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}
