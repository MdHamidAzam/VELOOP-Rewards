import { FiBell, FiCheckCircle, FiCreditCard, FiSearch } from "react-icons/fi";
import styles from "./HowToParticipate.module.css";

const steps = [
	{
		number: "01",
		title: "Choose a Giveaway",
		description: "Explore an available giveaway and choose the reward you want to pursue.",
		Icon: FiSearch,
	},
	{
		number: "02",
		title: "Check Your Eligibility",
		description: "Review the giveaway details, eligibility, and rules before participating.",
		Icon: FiCheckCircle,
	},
	{
		number: "03",
		title: "Join with the Required Currency",
		description: "Use the entry fee and currency specified for your selected giveaway.",
		Icon: FiCreditCard,
	},
	{
		number: "04",
		title: "Wait for the Winner Announcement",
		description: "After the giveaway ends, selected winners are announced for the available rewards.",
		Icon: FiBell,
	},
];

export default function HowToParticipate() {
	return (
		<section className={styles.section} aria-labelledby="how-it-works-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Simple participation</p>
					<h2 id="how-it-works-title">How It Works</h2>
					<p>Follow four clear steps from choosing a reward to the winner announcement.</p>
				</div>

				<ol className={styles.steps}>
					{steps.map(({ number, title, description, Icon }) => (
						<li className={styles.step} key={number}>
							<div className={styles.stepMarker} aria-hidden="true">
								<Icon />
							</div>
							<p className={styles.stepNumber}>Step {number}</p>
							<h3>{title}</h3>
							<p className={styles.description}>{description}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
