import { Link } from "react-router-dom";
import styles from "./Error.module.css";

export default function Error() {
	return <main className={styles.page} role="alert"><section className={styles.card}><p className={styles.eyebrow}>Something went wrong</p><h1>We could not load this reward experience.</h1><p>Please return to the giveaway page and try again.</p><Link className={styles.link} to="/">Back to giveaways</Link></section></main>;
}
