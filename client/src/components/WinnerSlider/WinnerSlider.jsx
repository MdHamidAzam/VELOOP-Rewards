import { useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiAward, FiCheckCircle } from "react-icons/fi";
import styles from "./WinnerSlider.module.css";

export default function WinnerSlider({ giveaway, previousWinners, loading, error, onRetry }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const announcements = [
		...(giveaway?.winners ?? []).map((winner) => ({ winner, giveaway })),
		...previousWinners.flatMap(({ giveaway: historicalGiveaway, winners }) => winners.map((winner) => ({ winner, giveaway: historicalGiveaway }))),
	];
	const activeAnnouncement = announcements[activeIndex % Math.max(announcements.length, 1)];

	useEffect(() => {
		setActiveIndex(0);
	}, [giveaway?.id, previousWinners.length]);

	useEffect(() => {
		if (isPaused || announcements.length < 2) return undefined;
		const intervalId = window.setInterval(() => setActiveIndex((index) => (index + 1) % announcements.length), 6000);
		return () => window.clearInterval(intervalId);
	}, [announcements.length, isPaused]);

	if (loading) return <section className={styles.section} aria-live="polite"><div className={`${styles.container} container`}><p>Loading winner announcements...</p></div></section>;
	if (error) return <section className={styles.section} role="alert"><div className={`${styles.container} container`}><p>Winner announcements could not be loaded.</p><button type="button" onClick={onRetry}>Try again</button></div></section>;
	if (!activeAnnouncement) return <section className={styles.section} aria-live="polite"><div className={`${styles.container} container`}><p>Winner announcements will appear after a giveaway is finalized.</p></div></section>;

	const hasMultipleAnnouncements = announcements.length > 1;
	const showPrevious = () => setActiveIndex((index) => (index === 0 ? announcements.length - 1 : index - 1));
	const showNext = () => setActiveIndex((index) => (index + 1) % announcements.length);
	const prize = activeAnnouncement.giveaway?.prizes?.find(({ id }) => id === activeAnnouncement.winner.prizeId) ?? {
		name: activeAnnouncement.winner.prizeName,
		image: activeAnnouncement.winner.prizeImage,
	};

	return (
		<section className={styles.section} aria-labelledby="winner-announcement-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Community rewards</p>
					<h2 id="winner-announcement-title">Winner Announcement</h2>
					<p>Celebrating the VELOOP community and the rewards they have won.</p>
				</div>

				<div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Winner announcements" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
					<div className={styles.visual}>
						{prize?.image ? (
							<img
								className={styles.image}
								src={prize.image}
								alt={`${prize.name} prize`}
							/>
						) : (
							<FiAward className={styles.fallbackIcon} aria-hidden="true" />
						)}
					</div>

					<div className={styles.content} aria-live="polite">
						<p className={styles.kicker}>Congratulations to our winner</p>
						<p className={styles.maskedId}>{activeAnnouncement.winner.maskedId}</p>
						<p className={styles.label}>Winner of</p>
						<h3>{prize?.name ?? "Reward"}</h3>
						<p className={styles.giveawayName}>{activeAnnouncement.giveaway.title}</p>
						<p className={styles.claimStatus}>
							<FiCheckCircle aria-hidden="true" />
							Winner status: {activeAnnouncement.winner.status ?? "SELECTED"}
						</p>
					</div>

					{hasMultipleAnnouncements && (
						<div className={styles.controls}>
							<button type="button" onClick={showPrevious} aria-label="Show previous winner announcement">
								<FiArrowLeft aria-hidden="true" />
							</button>
							<span aria-live="polite">{activeIndex + 1} / {announcements.length}</span>
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
