import { useRef, useState } from "react";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./BrowseGiveaways.module.css";

const FILTERS = [
	{ id: "ALL", label: "All" },
	{ id: "ACTIVE", label: "Active" },
	{ id: "UPCOMING", label: "Upcoming" },
	{ id: "ENDED", label: "Ended" },
];

function formatDate(value) {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function giveawayStatus(giveaway) {
	const status = giveaway.status?.toUpperCase();
	return status === "ARCHIVED" ? "ENDED" : status;
}

function GiveawayCard({ giveaway }) {
	const status = giveawayStatus(giveaway);
	const label = status === "ACTIVE" ? "Join Giveaway" : status === "UPCOMING" ? "Coming Soon" : "View Giveaway";
	const dateLabel = status === "UPCOMING"
		? formatDate(giveaway.startAt ?? giveaway.startDate)
		: formatDate(giveaway.endAt ?? giveaway.endDate);
	const datePrefix = status === "UPCOMING" ? "Starts" : status === "ACTIVE" ? "Ends" : "Ended";

	return (
		<article className={styles.card}>
			<div className={styles.cardTop}>
				<span className={`${styles.status} ${styles[status?.toLowerCase()] ?? ""}`}>{status}</span>
				{dateLabel && <span className={styles.date}><FiCalendar aria-hidden="true" />{datePrefix} {dateLabel}</span>}
			</div>
			<h3>{giveaway.title}</h3>
			{giveaway.description && <p className={styles.description}>{giveaway.description}</p>}
			<div className={styles.cardBottom}>
				<Link className={styles.cta} to={`/giveaway/${encodeURIComponent(giveaway.id)}`}>
					{label}<FiArrowRight aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}

export default function BrowseGiveaways({ giveaways = [], loading, error, onRetry }) {
	const [activeFilter, setActiveFilter] = useState("ALL");
	const tabRefs = useRef([]);
	const visibleGiveaways = giveaways.filter((giveaway) => {
		const status = giveawayStatus(giveaway);
		return activeFilter === "ALL" || status === activeFilter;
	});

	const handleTabKeyDown = (event, index) => {
		let nextIndex;
		if (event.key === "ArrowRight") nextIndex = (index + 1) % FILTERS.length;
		if (event.key === "ArrowLeft") nextIndex = (index - 1 + FILTERS.length) % FILTERS.length;
		if (event.key === "Home") nextIndex = 0;
		if (event.key === "End") nextIndex = FILTERS.length - 1;
		if (nextIndex === undefined) return;

		event.preventDefault();
		setActiveFilter(FILTERS[nextIndex].id);
		tabRefs.current[nextIndex]?.focus();
	};

	return (
		<section className={styles.section} id="browse-giveaways" aria-labelledby="browse-giveaways-title">
			<div className={`${styles.container} container`}>
				<div className={styles.headingGroup}>
					<p className={styles.eyebrow}>Find your next reward</p>
					<h2 id="browse-giveaways-title">Browse Giveaways</h2>
					<p>Browse current, upcoming, and completed giveaways.</p>
				</div>

				<div className={styles.tabs} role="tablist" aria-label="Filter giveaways by status">
					{FILTERS.map((filter, index) => (
						<button
							className={`${styles.tab} ${activeFilter === filter.id ? styles.activeTab : ""}`}
							key={filter.id}
							ref={(element) => { tabRefs.current[index] = element; }}
							id={`browse-${filter.id.toLowerCase()}-tab`}
							type="button"
							role="tab"
							aria-selected={activeFilter === filter.id}
							aria-controls="browse-giveaways-panel"
							tabIndex={activeFilter === filter.id ? 0 : -1}
							onClick={() => setActiveFilter(filter.id)}
							onKeyDown={(event) => handleTabKeyDown(event, index)}
						>
							{filter.label}
						</button>
						))}
				</div>

				<div className={styles.panel} id="browse-giveaways-panel" role="tabpanel" aria-labelledby={`browse-${activeFilter.toLowerCase()}-tab`} tabIndex={0}>
					{loading ? (
						<p className={styles.state} role="status">Loading giveaways...</p>
					) : error ? (
						<div className={styles.state} role="alert">
							<p>Giveaways could not be loaded.</p>
							<button className={styles.retry} type="button" onClick={() => onRetry().catch(() => undefined)}>Try again</button>
						</div>
					) : visibleGiveaways.length > 0 ? (
						<div className={styles.grid}>
							{visibleGiveaways.map((giveaway) => <GiveawayCard giveaway={giveaway} key={giveaway.id} />)}
						</div>
					) : (
						<p className={styles.state} role="status">
							{giveaways.length === 0 ? "No giveaways are available right now." : `No ${activeFilter.toLowerCase()} giveaways are available right now.`}
						</p>
					)}
				</div>
			</div>
		</section>
	);
}