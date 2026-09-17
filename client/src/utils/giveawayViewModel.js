import airpodsImage from "../assets/images/ChatGPT Image Aug 19, 2026, 02_06_07 PM.png";
import appleWatchImage from "../assets/images/ChatGPT Image Aug 19, 2026, 01_55_25 PM.png";
import amazon2000GiftCardImage from "../assets/images/ChatGPT Image Aug 19, 2026, 03_22_24 PM.png";
import iphone15ProImage from "../assets/images/ChatGPT Image Aug 19, 2026, 01_49_05 PM.png";
import voucher20Image from "../assets/images/ChatGPT Image Aug 19, 2026, 05_07_43 PM.png";

const prizeAssets = Object.freeze({
	"ChatGPT Image Aug 19, 2026, 01_49_05 PM.png": iphone15ProImage,
	"ChatGPT Image Aug 19, 2026, 01_55_25 PM.png": appleWatchImage,
	"ChatGPT Image Aug 19, 2026, 02_06_07 PM.png": airpodsImage,
	"ChatGPT Image Aug 19, 2026, 03_22_24 PM.png": amazon2000GiftCardImage,
	"ChatGPT Image Aug 19, 2026, 05_07_43 PM.png": voucher20Image,
});

function resolvePrizeImage(image) {
	if (typeof image !== "string" || !image) return image ?? null;
	const assetKey = image.split("/").pop();
	return prizeAssets[assetKey] ?? image;
}

export function mapCurrentGiveaway(giveaway) {
	if (!giveaway) return null;

	return {
		...giveaway,
		prizes: Array.isArray(giveaway.prizes)
			? giveaway.prizes.map((prize) => ({ ...prize, image: resolvePrizeImage(prize.image) }))
			: giveaway.prizes,
	};
}
