import { Outlet } from "react-router-dom";
import HomeNavbar from "../components/navbars/HomeNavbar";
import Footer from "../components/home/Footer";

export default function PublicLayout() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      
      {/* Fixed Navbar */}
      <HomeNavbar />

      {/* Main Content */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
