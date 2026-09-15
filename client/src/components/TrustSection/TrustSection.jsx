import { FiClipboard, FiEye, FiLock, FiUsers } from "react-icons/fi";
import styles from "./TrustSection.module.css";

const trustPoints = [
	{
		title: "Transparent Rules",
		description: "Review the participation details and rules before entering a giveaway.",
		Icon: FiClipboard,
	},
	{
		title: "Secure Handling",
		description: "Prize claims and participation details follow the documented project flow.",
		Icon: FiLock,
	},
	{
		title: "Fair Participation",
		description: "Every giveaway presents its entry requirements clearly for participants to review.",
		Icon: FiUsers,
	},
	{
		title: "Reward Transparency",
		description: "Prize details and winner information are presented clearly throughout the experience.",
		Icon: FiEye,
	},
];

export default function TrustSection() {
	return (
		<section className={styles.section} aria-labelledby="trust-section-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>A clear rewards experience</p>
					<h2 id="trust-section-title">Why Trust VELOOP</h2>
					<p>Important details stay visible so you can make informed participation decisions.</p>
				</div>

				<ul className={styles.grid}>
					{trustPoints.map(({ title, description, Icon }) => (
						<li className={styles.point} key={title}>
							<div className={styles.icon} aria-hidden="true">
								<Icon />
							</div>
							<div>
								<h3>{title}</h3>
								<p>{description}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
