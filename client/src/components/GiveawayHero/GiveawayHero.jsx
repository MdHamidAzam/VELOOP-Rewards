import { Link } from "react-router-dom";
import giftImage from "../../assets/images/img.png";
import ticketImage from "../../assets/images/ChatGPT Image Aug 19, 2026, 01_36_29 PM.png";
import styles from "./GiveawayHero.module.css";

export default function GiveawayHero({ giveaway }) {
	const statusClass = giveaway.status?.toLowerCase() ?? "ended";
	const featurePills = ["Reward-ready", "Verified entries", "Secure access"];

	return (
		<section className={styles.hero} aria-labelledby="giveaway-hero-title">
			<div className={`${styles.heroInner} container`}>
				<div className={styles.copy}>
					<p className={styles.eyebrow}>
						<span className={`${styles.statusDot} ${styles[statusClass]}`} aria-hidden="true" />
						{giveaway.status} giveaway
					</p>
					<h1 id="giveaway-hero-title">{giveaway.title}</h1>
					<p className={styles.description}>{giveaway.description}</p>
					<div className={styles.metaRow} aria-label="Giveaway value points">
						{featurePills.map((text) => (
							<span key={text} className={styles.metaPill}>{text}</span>
						))}
					</div>
					<Link className={styles.cta} to={`/giveaway/${giveaway.id}`}>
						Explore Giveaway
						<span aria-hidden="true">→</span>
					</Link>
				</div>

				<div className={styles.illustrationFrame}>
					<img className={styles.leftGift} src={giftImage} alt="" aria-hidden="true" />
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
