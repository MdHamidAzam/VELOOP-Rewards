import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../hooks/useAuth.js";

const navigationItems = [
	{ label: "Giveaways", to: "/" },
	{ label: "Previous Winners", to: "/#previous-winners" },
];

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { isAuthenticated, logout } = useAuth();

	const closeMenu = () => setIsMenuOpen(false);

	return (
		<header className={styles.header}>
			<nav className={`${styles.navbar} container`} aria-label="Primary navigation">
				<Link className={styles.brand} to="/" onClick={closeMenu} aria-label="VELOOP home">
					<span className={styles.brandMark} aria-hidden="true">V</span>
					<span className={styles.brandText}>VELOOP</span>
					<span className={styles.productBadge}>Rewards</span>
				</Link>

				<button
					className={styles.menuButton}
					type="button"
					aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
					aria-expanded={isMenuOpen}
					aria-controls="primary-navigation"
					onClick={() => setIsMenuOpen((open) => !open)}
				>
					{isMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
				</button>

				<div
					id="primary-navigation"
					className={`${styles.navigation} ${isMenuOpen ? styles.navigationOpen : ""}`}
				>
					<div className={styles.links}>
						{navigationItems.map((item) => (
							<NavLink
								key={item.label}
								className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`.trim()}
								to={item.to}
								onClick={closeMenu}
							>
								{item.label}
							</NavLink>
						))}
					</div>
					{isAuthenticated ? (
						<button className={styles.loginLink} type="button" onClick={() => { logout(); closeMenu(); }}>
							Log out
						</button>
					) : (
						<Link className={styles.loginLink} to="/login" onClick={closeMenu}>Login</Link>
					)}
				</div>
			</nav>
		</header>
	);
}
