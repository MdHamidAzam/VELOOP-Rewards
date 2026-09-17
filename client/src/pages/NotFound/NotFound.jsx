import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
	return <main className={styles.page}><section className={styles.card}><p className={styles.eyebrow}>404</p><h1>This giveaway page is unavailable.</h1><p>Return to the current rewards experience to continue exploring.</p><Link className={styles.link} to="/">Back to giveaways</Link></section></main>;
}
