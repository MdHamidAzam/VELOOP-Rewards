import { FiAward, FiCheckCircle } from "react-icons/fi";
import styles from "./WinnerCard.module.css";

export default function WinnerCard({ winner, giveaway, prize }) {
	return (
		<article className={styles.card}>
			<div className={styles.imageArea}>
				{prize.image ? (
					<img className={styles.image} src={prize.image} alt={`${prize.name} prize`} />
				) : (
					<FiAward className={styles.fallbackIcon} aria-hidden="true" />
				)}
			</div>
			<div className={styles.content}>
				<p className={styles.eyebrow}>Current winner</p>
				<p className={styles.maskedId}>{winner.maskedId}</p>
				<h3>{prize.name}</h3>
				<p className={styles.giveaway}>{giveaway.title}</p>
				<p className={styles.status}>
					<FiCheckCircle aria-hidden="true" />
					Claim status: {winner.claimStatus}
				</p>
			</div>
		</article>
	);
}
