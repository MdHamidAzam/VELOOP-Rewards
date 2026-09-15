import { CURRENT_GIVEAWAY as currentGiveaway } from "../../data/giveawayData.js";
import PrizeCard from "../PrizeCard/PrizeCard.jsx";
import styles from "./FeaturedGiveaways.module.css";

export default function FeaturedGiveaways() {
	return (
		<section className={styles.section} aria-labelledby="featured-giveaways-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Reward collection</p>
					<h2 id="featured-giveaways-title">Featured Giveaways</h2>
					<p>Explore the available rewards in the current VELOOP giveaway.</p>
				</div>

				<div className={styles.grid}>
					{currentGiveaway.prizes.map((prize) => (
						<PrizeCard key={prize.id} prize={prize} giveawayId={currentGiveaway.id} />
					))}
				</div>
			</div>
		</section>
	);
}
