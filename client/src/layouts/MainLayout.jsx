import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar.jsx";
import { AuthProvider } from "../context/AuthContext.jsx";
import DemoIndicator from "../components/common/DemoIndicator.jsx";

export default function MainLayout() {
	return <AuthProvider><Navbar /><Outlet /><DemoIndicator /></AuthProvider>;
}
