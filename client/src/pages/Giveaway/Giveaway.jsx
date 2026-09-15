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

export default function Giveaway() {
	return (
		<>
			<GiveawayHero />
			<Countdown />
			<GiveawayStats />
			<FeaturedGiveaways />
			<GiveawayRules />
			<HowToParticipate />
			<WinnerSlider />
			<WinnersTabs />
			<TrustSection />
			<FAQ />
			<FinalCTA />
			<Footer />
		</>
	);
}
