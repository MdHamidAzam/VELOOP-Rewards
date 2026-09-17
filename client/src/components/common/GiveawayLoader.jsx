import { FiGift } from "react-icons/fi";
import styles from "./GiveawayLoader.module.css";

export default function GiveawayLoader({ label = "Preparing today's rewards..." }) {
	return <section className={styles.loader} aria-live="polite" aria-busy="true"><div className={styles.icon}><FiGift aria-hidden="true" /></div><p>{label}</p><span className={styles.dots} aria-hidden="true">•••</span></section>;
}