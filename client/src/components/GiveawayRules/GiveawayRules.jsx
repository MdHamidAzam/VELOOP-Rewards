import { useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiGift, FiList, FiUsers } from "react-icons/fi";
import styles from "./GiveawayRules.module.css";

const rules = [
	{
		id: "eligibility",
		title: "Eligibility",
		description: "Check the published giveaway details to confirm that you meet the participation requirements before entering.",
		Icon: FiCheckCircle,
	},
	{
		id: "participation-requirements",
		title: "Participation Requirements",
		description: "Use an available account and follow the instructions shown for the giveaway you choose.",
		Icon: FiUsers,
	},
	{
		id: "entry-rules",
		title: "Entry Rules",
		description: "Review the required entry fee, currency, and any entry limits before submitting participation.",
		Icon: FiList,
	},
	{
		id: "winner-selection",
		title: "Winner Selection",
		description: "After the giveaway ends, winners are selected according to the process described for that event.",
		Icon: FiGift,
	},
	{
		id: "prize-claim-period",
		title: "Prize Claim Period",
		description: "Winners should review the displayed claim status and follow the available claim instructions within the stated period.",
		Icon: FiClock,
	},
	{
		id: "disqualification-fraud-abuse",
		title: "Disqualification & Fraud/Abuse Policy",
		description: "Suspicious, abusive, or rule-breaking activity may be reviewed and can affect participation eligibility.",
		Icon: FiAlertTriangle,
	},
];

export default function GiveawayRules() {
	const [openId, setOpenId] = useState(null);

	const toggleRule = (id) => {
		setOpenId((currentId) => (currentId === id ? null : id));
	};

	return (
		<section className={styles.section} aria-labelledby="giveaway-rules-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Participation reference</p>
					<h2 id="giveaway-rules-title">Giveaway Rules &amp; Guidelines</h2>
					<p>Informational example guidelines to review before participating in a VELOOP giveaway.</p>
				</div>

				<div className={styles.list}>
					{rules.map(({ id, title, description, Icon }) => {
						const isOpen = openId === id;
						const panelId = `${id}-details`;

						return (
							<div className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`} key={id}>
								<h3 className={styles.titleHeading}>
									<button
										className={styles.trigger}
										type="button"
										aria-expanded={isOpen}
										aria-controls={panelId}
										onClick={() => toggleRule(id)}
									>
										<span className={styles.icon} aria-hidden="true"><Icon /></span>
										<span>{title}</span>
										<span className={styles.state} aria-hidden="true">{isOpen ? "-" : "+"}</span>
									</button>
								</h3>
								<div className={styles.details} id={panelId} hidden={!isOpen}>
									<p>{description}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
