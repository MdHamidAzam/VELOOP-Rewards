import { useState } from "react";
import { FiArrowLeft, FiArrowRight, FiAward, FiCheckCircle } from "react-icons/fi";
import { GIVEAWAYS } from "../../data/giveawayData.js";
import { WINNER_ANNOUNCEMENTS } from "../../data/winnerData.js";
import styles from "./WinnerSlider.module.css";

function getAnnouncementDetails(announcement) {
	const giveaway = GIVEAWAYS.find(({ id }) => id === announcement.giveawayId);
	const prize = giveaway?.prizes.find(({ id }) => id === announcement.prizeId);

	return { announcement, giveaway, prize };
}

export default function WinnerSlider() {
	const [activeIndex, setActiveIndex] = useState(0);
	const activeAnnouncement = getAnnouncementDetails(WINNER_ANNOUNCEMENTS[activeIndex]);

	if (!activeAnnouncement.giveaway || !activeAnnouncement.prize) {
		return null;
	}

	const hasMultipleAnnouncements = WINNER_ANNOUNCEMENTS.length > 1;
	const showPrevious = () => setActiveIndex((index) => (index === 0 ? WINNER_ANNOUNCEMENTS.length - 1 : index - 1));
	const showNext = () => setActiveIndex((index) => (index + 1) % WINNER_ANNOUNCEMENTS.length);

	return (
		<section className={styles.section} aria-labelledby="winner-announcement-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Community rewards</p>
					<h2 id="winner-announcement-title">Winner Announcement</h2>
					<p>Celebrating the VELOOP community and the rewards they have won.</p>
				</div>

				<div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Winner announcements">
					<div className={styles.visual}>
						{activeAnnouncement.prize.image ? (
							<img
								className={styles.image}
								src={activeAnnouncement.prize.image}
								alt={`${activeAnnouncement.prize.name} prize`}
							/>
						) : (
							<FiAward className={styles.fallbackIcon} aria-hidden="true" />
						)}
					</div>

					<div className={styles.content} aria-live="polite">
						<p className={styles.kicker}>Congratulations to our winner</p>
						<p className={styles.maskedId}>{activeAnnouncement.announcement.maskedId}</p>
						<p className={styles.label}>Winner of</p>
						<h3>{activeAnnouncement.prize.name}</h3>
						<p className={styles.giveawayName}>{activeAnnouncement.giveaway.title}</p>
						<p className={styles.claimStatus}>
							<FiCheckCircle aria-hidden="true" />
							Claim status: {activeAnnouncement.announcement.claimStatus}
						</p>
					</div>

					{hasMultipleAnnouncements && (
						<div className={styles.controls}>
							<button type="button" onClick={showPrevious} aria-label="Show previous winner announcement">
								<FiArrowLeft aria-hidden="true" />
							</button>
							<span aria-live="polite">{activeIndex + 1} / {WINNER_ANNOUNCEMENTS.length}</span>
							<button type="button" onClick={showNext} aria-label="Show next winner announcement">
								<FiArrowRight aria-hidden="true" />
							</button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
