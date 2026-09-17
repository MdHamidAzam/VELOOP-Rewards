import { FiArchive, FiCheckCircle } from "react-icons/fi";
import styles from "./PreviousWinnerCard.module.css";

export default function PreviousWinnerCard({ winner, giveaway, prize }) {
	return (
		<article className={styles.card}>
			<div className={styles.content}>
				<p className={styles.eyebrow}>Previous winner</p>
				<p className={styles.maskedId}>{winner.maskedId}</p>
				<h3>{prize.name}</h3>
				<p className={styles.giveaway}>{giveaway.title}</p>
				<p className={styles.status}>
					<FiCheckCircle aria-hidden="true" />
					Winner status: {winner.status ?? "SELECTED"}
				</p>
			</div>
			<div className={styles.archiveIcon} aria-hidden="true">
				<FiArchive />
			</div>
		</article>
);
}
