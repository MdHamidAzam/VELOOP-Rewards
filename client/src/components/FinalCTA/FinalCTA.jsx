import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { GIVEAWAY_STATUS } from "../../data/giveawayData.js";
import styles from "./FinalCTA.module.css";

const ctaCopy = {
	[GIVEAWAY_STATUS.ACTIVE]: {
		eyebrow: "Your next reward is here",
		title: "Ready to explore the giveaway?",
		description: "Review the current reward, entry requirements, and guidelines before taking your next step.",
		label: "Explore Giveaway",
	},
	[GIVEAWAY_STATUS.UPCOMING]: {
		eyebrow: "A new reward is on the way",
		title: "Get ready for the next giveaway",
		description: "Review the current details now and return when participation becomes available.",
		label: "View Giveaway Details",
	},
	[GIVEAWAY_STATUS.ENDED]: {
		eyebrow: "Reward details",
		title: "Explore this giveaway’s results",
		description: "Review the giveaway details and available winner information from this completed event.",
		label: "View Giveaway Details",
	},
};

export default function FinalCTA({ giveaway }) {
	if (!giveaway) return null;
	const activeGiveaway = giveaway;
	const copy = ctaCopy[activeGiveaway.status] ?? ctaCopy[GIVEAWAY_STATUS.ENDED];

	return (
		<section className={styles.section} aria-labelledby="final-cta-title">
			<div className={`${styles.container} container`}>
				<div>
					<p className={styles.eyebrow}>{copy.eyebrow}</p>
					<h2 id="final-cta-title">{copy.title}</h2>
					<p className={styles.description}>{copy.description}</p>
				</div>
				<Link className={styles.cta} to={`/giveaway/${activeGiveaway.id}`}>
					{copy.label}
					<FiArrowRight aria-hidden="true" />
				</Link>
			</div>
		</section>
	);
}