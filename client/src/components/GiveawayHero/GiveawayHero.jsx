import { Link } from "react-router-dom";
import { CURRENT_GIVEAWAY as currentGiveaway } from "../../data/giveawayData.js";
import ticketImage from "../../assets/images/ChatGPT Image Aug 19, 2026, 01_36_29 PM.png";
import styles from "./GiveawayHero.module.css";

export default function GiveawayHero() {
	return (
		<section className={styles.hero} aria-labelledby="giveaway-hero-title">
			<div className={`${styles.heroInner} container`}>
				<div className={styles.copy}>
					<p className={styles.eyebrow}>
						<span className={styles.statusDot} aria-hidden="true" />
						{currentGiveaway.status} giveaway
					</p>
					<h1 id="giveaway-hero-title">{currentGiveaway.title}</h1>
					<p className={styles.description}>{currentGiveaway.description}</p>
					<Link className={styles.cta} to={`/giveaway/${currentGiveaway.id}`}>
						Explore Giveaway
						<span aria-hidden="true">-&gt;</span>
					</Link>
				</div>

				<div className={styles.illustrationFrame}>
					<div className={styles.illustrationAccent} aria-hidden="true" />
					<img
						className={styles.illustration}
						src={ticketImage}
						alt="Golden giveaway ticket held in a hand"
					/>
				</div>
			</div>
		</section>
	);
}
