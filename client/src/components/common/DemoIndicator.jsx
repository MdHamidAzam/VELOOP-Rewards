import { DEMO_MODE } from "../../services/demoData.js";
import styles from "./DemoIndicator.module.css";

export default function DemoIndicator() {
	if (!DEMO_MODE) return null;
	return (
		<div className={styles.indicator} role="status" aria-live="polite">
			<span className={styles.dot} aria-hidden="true" />
			Development data note
		</div>
	);
}