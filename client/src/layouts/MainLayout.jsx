import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar.jsx";

export default function MainLayout() {
	return (
		<>
			<Navbar />
			<Outlet />
		</>
	);
}
