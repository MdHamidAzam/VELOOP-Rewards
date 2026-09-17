import { useRef, useState } from "react";
import PreviousWinnerCard from "../PreviousWinnerCard/PreviousWinnerCard.jsx";
import WinnerCard from "../WinnerCard/WinnerCard.jsx";
import styles from "./WinnersTabs.module.css";

const tabs = [
	{ id: "current-winners", label: "Current Winners" },
	{ id: "previous-winners", label: "Previous Winners" },
];

export default function WinnersTabs({ giveaway, previousWinners, loading, error, onRetry }) {
	const [activeTab, setActiveTab] = useState("current-winners");
	const tabRefs = useRef([]);
	const currentWinners = giveaway?.winners ?? [];
	const currentEmptyMessage = giveaway?.status === "ENDED" || giveaway?.status === "ARCHIVED"
		? "No finalized winners are available for this giveaway."
		: giveaway?.status === "UPCOMING"
			? "Winners will appear after this giveaway is completed."
			: "This giveaway is still live. Winners will be announced after it ends.";

	const selectTab = (tabId) => setActiveTab(tabId);
	const handleTabKeyDown = (event, index) => {
		let nextIndex;
		if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
		if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
		if (event.key === "Home") nextIndex = 0;
		if (event.key === "End") nextIndex = tabs.length - 1;
		if (nextIndex === undefined) return;

		event.preventDefault();
		const nextTab = tabs[nextIndex];
		selectTab(nextTab.id);
		tabRefs.current[nextIndex]?.focus();
	};

	return (
		<section id="previous-winners" className={styles.section} aria-labelledby="winners-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Community highlights</p>
					<h2 id="winners-title">Winners</h2>
					<p>Recognizing the VELOOP members behind the latest and past rewards.</p>
				</div>

				<div className={styles.tabList} role="tablist" aria-label="Winner history">
					{tabs.map((tab, index) => (
						<button
							className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ""}`}
							key={tab.id}
							ref={(element) => { tabRefs.current[index] = element; }}
							id={tab.id}
							type="button"
							role="tab"
							aria-selected={activeTab === tab.id}
							aria-controls={`${tab.id}-panel`}
							tabIndex={activeTab === tab.id ? 0 : -1}
							onClick={() => selectTab(tab.id)}
							onKeyDown={(event) => handleTabKeyDown(event, index)}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div
					className={styles.panel}
					id={`${activeTab}-panel`}
					role="tabpanel"
					aria-labelledby={activeTab}
					tabIndex={0}
				>
					{activeTab === "current-winners" ? (
						currentWinners.length > 0 ? (
							<div className={styles.grid}>
								{currentWinners.map((winner) => {
									const prize = giveaway?.prizes?.find(({ id }) => id === winner.prizeId);
									return <WinnerCard key={winner.id} winner={winner} giveaway={giveaway} prize={prize} />;
								})}
							</div>
						) : <p className={styles.emptyState}>{currentEmptyMessage}</p>
					) : loading ? (
						<p className={styles.emptyState} aria-live="polite">Loading previous winners...</p>
					) : error ? (
						<div className={styles.emptyState} role="alert"><p>Previous winners could not be loaded.</p><button type="button" onClick={onRetry}>Try again</button></div>
					) : previousWinners.length > 0 ? (
						<div className={styles.grid}>
							{previousWinners.flatMap(({ giveaway: historicalGiveaway, winners }) => winners.map((winner) => (
								<PreviousWinnerCard key={winner.id} winner={winner} giveaway={historicalGiveaway} prize={{ name: winner.prizeName, image: winner.prizeImage }} />
							)))}
						</div>
					) : <p className={styles.emptyState}>Previous winners will appear here after a giveaway is completed.</p>}
				</div>
			</div>
		</section>
	);
}
