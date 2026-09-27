import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import DemoIndicator from "../components/common/DemoIndicator.jsx";

function HashScroll() {
	const { hash, pathname } = useLocation();

	useEffect(() => {
		if (!hash) return undefined;
		const frameId = window.requestAnimationFrame(() => {
			document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
		return () => window.cancelAnimationFrame(frameId);
	}, [hash, pathname]);

	return null;
}

export default function MainLayout() {
	return <AuthProvider><HashScroll /><Navbar /><Outlet /><DemoIndicator /></AuthProvider>;
}
