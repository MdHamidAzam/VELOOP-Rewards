import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const navigationLinks = [
	{ label: "Giveaways", to: "/" },
	{ label: "Previous Winners", to: "/#winners-title" },
	{ label: "How It Works", to: "/#how-it-works-title" },
	{ label: "Rules", to: "/#giveaway-rules-title" },
	{ label: "FAQ", to: "/#faq-title" },
];

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={`${styles.container} container`}>
				<div className={styles.brandColumn}>
					<Link className={styles.brand} to="/" aria-label="VELOOP home">VELOOP</Link>
					<p>Clear, reward-focused giveaway experiences built for the VELOOP community.</p>
				</div>
				<nav className={styles.navigation} aria-label="Footer navigation">
					<p className={styles.navigationTitle}>Explore</p>
					<ul>
						{navigationLinks.map(({ label, to }) => (
							<li key={label}><Link to={to}>{label}</Link></li>
						))}
					</ul>
				</nav>
			</div>
			<div className={`${styles.bottom} container`}>
				<p>&copy; {new Date().getFullYear()} VELOOP. Development project.</p>
			</div>
		</footer>
	);
}
