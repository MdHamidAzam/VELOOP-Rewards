import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Giveaway from "./pages/Giveaway/Giveaway.jsx";
import GiveawayDetails from "./pages/GiveawayDetails/GiveawayDetails.jsx";
import Login from "./pages/Login/Login.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Giveaway />} />
          <Route path="/giveaway/:giveawayId" element={<GiveawayDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}