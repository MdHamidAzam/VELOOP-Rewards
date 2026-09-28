import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PrizeCard from "../PrizeCard/PrizeCard.jsx";
import styles from "./FeaturedGiveaways.module.css";

export default function FeaturedGiveaways({ giveaway }) {
	const carouselRef = useRef(null);
	const scrollCarousel = (direction) => {
		if (!carouselRef.current) return;
		carouselRef.current.scrollBy({ left: direction * carouselRef.current.clientWidth * 0.82, behavior: "smooth" });
	};

	return (
		<section className={styles.section} aria-labelledby="featured-giveaways-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingRow}>
					<div className={styles.headingGroup}>
						<p className={styles.eyebrow}>Reward collection</p>
						<h2 id="featured-giveaways-title">Featured Giveaways</h2>
						<p>Explore the available rewards in the current VELOOP giveaway.</p>
					</div>
					<div className={styles.controls} aria-label="Featured giveaway carousel controls">
						<button type="button" onClick={() => scrollCarousel(-1)} aria-label="Show previous giveaways" aria-controls="featured-giveaways-carousel">
							<FiChevronLeft aria-hidden="true" />
						</button>
						<button type="button" onClick={() => scrollCarousel(1)} aria-label="Show next giveaways" aria-controls="featured-giveaways-carousel">
							<FiChevronRight aria-hidden="true" />
						</button>
					</div>
				</div>

				<div id="featured-giveaways-carousel" ref={carouselRef} className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Featured giveaways" tabIndex={0}>
					{giveaway.prizes.map((prize) => (
						<PrizeCard key={prize.id} prize={prize} giveawayId={giveaway.id} giveawayStatus={giveaway.status} />
					))}
				</div>
			</div>
		</section>
	);
}
