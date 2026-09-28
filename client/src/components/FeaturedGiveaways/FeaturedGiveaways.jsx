import PrizeCard from "../PrizeCard/PrizeCard.jsx";
import styles from "./FeaturedGiveaways.module.css";

export default function FeaturedGiveaways({ giveaway }) {
	return (
		<section className={styles.section} aria-labelledby="featured-giveaways-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Reward collection</p>
					<h2 id="featured-giveaways-title">Featured Giveaways</h2>
					<p>Explore the available rewards in the current VELOOP giveaway.</p>
				</div>

				<div className={styles.grid}>
					{giveaway.prizes.map((prize) => (
						<PrizeCard key={prize.id} prize={prize} giveawayId={giveaway.id} giveawayStatus={giveaway.status} />
					))}
				</div>
			</div>
		</section>
	);
}
