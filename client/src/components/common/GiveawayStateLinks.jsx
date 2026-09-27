import { Link } from "react-router-dom";
import styles from "./GiveawayStateLinks.module.css";

const QA_GIVEAWAYS = [
	{ id: "GW-2026-09", label: "Active giveaway" },
	{ id: "GW-2026-08", label: "Ended giveaway" },
	{ id: "GW-2026-10", label: "Upcoming giveaway" },
];

export default function GiveawayStateLinks() {
	if (!import.meta.env.DEV) return null;

	return (
		<section className={styles.section} aria-labelledby="giveaway-state-links-title">
			<div className={`${styles.container} container`}>
				<p className={styles.eyebrow}>QA access</p>
				<h2 id="giveaway-state-links-title">Giveaway states</h2>
				<nav className={styles.links} aria-label="Giveaway state routes">
					{QA_GIVEAWAYS.map(({ id, label }) => <Link key={id} to={`/giveaway/${id}`}>{label}</Link>)}
				</nav>
			</div>
		</section>
	);
}