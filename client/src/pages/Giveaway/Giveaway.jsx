import GiveawayHero from "../../components/GiveawayHero/GiveawayHero.jsx";
import GiveawayStats from "../../components/GiveawayStats/GiveawayStats.jsx";
import Countdown from "../../components/Countdown/Countdown.jsx";
import FeaturedGiveaways from "../../components/FeaturedGiveaways/FeaturedGiveaways.jsx";
import GiveawayRules from "../../components/GiveawayRules/GiveawayRules.jsx";
import HowToParticipate from "../../components/HowToParticipate/HowToParticipate.jsx";
import WinnerSlider from "../../components/WinnerSlider/WinnerSlider.jsx";
import WinnersTabs from "../../components/WinnersTabs/WinnersTabs.jsx";
import TrustSection from "../../components/TrustSection/TrustSection.jsx";
import FAQ from "../../components/FAQ/FAQ.jsx";
import FinalCTA from "../../components/FinalCTA/FinalCTA.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import GiveawayLoader from "../../components/common/GiveawayLoader.jsx";
import { useGiveaway } from "../../hooks/useGiveaway.js";
import { usePreviousWinners } from "../../hooks/usePreviousWinners.js";
import { mapCurrentGiveaway } from "../../utils/giveawayViewModel.js";
import styles from "./Giveaway.module.css";

function CurrentGiveawayState({ loading, error, onRetry }) {
	if (loading) {
		return <GiveawayLoader />;
	}

	if (error) {
		return (
			<section className={styles.dataState} role="alert">
				<p>We could not load the current giveaway.</p>
				<button type="button" onClick={onRetry}>Try again</button>
			</section>
		);
	}

	return <section className={styles.dataState} aria-live="polite"><p>No current giveaway is available right now.</p></section>;
}

export default function Giveaway() {
	const { data, loading, error, reload } = useGiveaway();
	const previousWinners = usePreviousWinners();
	const giveaway = mapCurrentGiveaway(data);
	const hasCurrentGiveaway = !loading && !error && giveaway;

	return (
		<>
			{hasCurrentGiveaway ? (
				<>
					<GiveawayHero giveaway={giveaway} />
					<Countdown giveaway={giveaway} />
					<GiveawayStats participantCount={giveaway.participantCount} statistics={giveaway.statistics} />
					<FeaturedGiveaways giveaway={giveaway} />
				</>
			) : <CurrentGiveawayState loading={loading} error={error} onRetry={reload} />}
			<GiveawayRules />
			<HowToParticipate />
			<WinnerSlider giveaway={giveaway} previousWinners={previousWinners.data} loading={previousWinners.loading} error={previousWinners.error} onRetry={previousWinners.reload} />
			<WinnersTabs giveaway={giveaway} previousWinners={previousWinners.data} loading={previousWinners.loading} error={previousWinners.error} onRetry={previousWinners.reload} />
			<TrustSection />
			<FAQ />
			<FinalCTA giveaway={giveaway} />
			<Footer />
		</>
	);
}
