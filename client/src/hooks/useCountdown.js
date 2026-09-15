import { useEffect, useState } from "react";

const EMPTY_TIME = Object.freeze({
	days: 0,
	hours: 0,
	minutes: 0,
	seconds: 0,
});

function getTimeRemaining(targetDate) {
	const difference = new Date(targetDate).getTime() - Date.now();

	if (!targetDate || Number.isNaN(new Date(targetDate).getTime()) || difference <= 0) {
		return { timeLeft: EMPTY_TIME, isEnded: true };
	}

	const totalSeconds = Math.floor(difference / 1000);

	return {
		timeLeft: {
			days: Math.floor(totalSeconds / 86400),
			hours: Math.floor((totalSeconds % 86400) / 3600),
			minutes: Math.floor((totalSeconds % 3600) / 60),
			seconds: totalSeconds % 60,
		},
		isEnded: false,
	};
}

export default function useCountdown(targetDate) {
	const [countdown, setCountdown] = useState(() => getTimeRemaining(targetDate));

	useEffect(() => {
		const updateCountdown = () => setCountdown(getTimeRemaining(targetDate));

		updateCountdown();
		const intervalId = window.setInterval(updateCountdown, 1000);

		return () => window.clearInterval(intervalId);
	}, [targetDate]);

	return countdown;
}
