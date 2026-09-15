import { useRef, useState } from "react";
import { GIVEAWAYS, PREVIOUS_GIVEAWAYS } from "../../data/giveawayData.js";
import { WINNER_ANNOUNCEMENTS, WINNERS } from "../../data/winnerData.js";
import PreviousWinnerCard from "../PreviousWinnerCard/PreviousWinnerCard.jsx";
import WinnerCard from "../WinnerCard/WinnerCard.jsx";
import styles from "./WinnersTabs.module.css";

const tabs = [
	{ id: "current-winners", label: "Current Winners" },
	{ id: "previous-winners", label: "Previous Winners" },
];

function resolveWinner(winner) {
	const giveaway = GIVEAWAYS.find(({ id }) => id === winner.giveawayId);
	const prize = giveaway?.prizes.find(({ id }) => id === winner.prizeId);

	return { winner, giveaway, prize };
}

export default function WinnersTabs() {
	const [activeTab, setActiveTab] = useState("current-winners");
	const tabRefs = useRef([]);
	const currentWinners = WINNERS.map(resolveWinner).filter(({ giveaway, prize }) => giveaway && prize);
	const previousGiveawayIds = new Set(PREVIOUS_GIVEAWAYS.map(({ id }) => id));
	const previousWinners = WINNER_ANNOUNCEMENTS
		.filter(({ giveawayId }) => previousGiveawayIds.has(giveawayId))
		.map(resolveWinner)
		.filter(({ giveaway, prize }) => giveaway && prize);

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
		<section className={styles.section} aria-labelledby="winners-title">
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
						<div className={styles.grid}>
							{currentWinners.map(({ winner, giveaway, prize }) => (
								<WinnerCard key={`${winner.giveawayId}-${winner.prizeId}-${winner.maskedId}`} winner={winner} giveaway={giveaway} prize={prize} />
							))}
						</div>
					) : (
						<div className={styles.grid}>
							{previousWinners.map(({ winner, giveaway, prize }) => (
								<PreviousWinnerCard key={`${winner.giveawayId}-${winner.prizeId}-${winner.maskedId}`} winner={winner} giveaway={giveaway} prize={prize} />
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
