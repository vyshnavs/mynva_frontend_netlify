import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import AdminNavbar from "../../components/navbars/AdminNavbar";

export default function AdminLayout({ children }) {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`
        min-h-screen flex flex-col 
        transition-colors duration-300
        ${theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}
      `}
    >
      {/* Top Navbar */}
      <AdminNavbar />

      {/* Main Content Wrapper */}
      <main className="flex-1 p-6">
        <div className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
          {children}
        </div>
      </main>
    </div>
  );
}
