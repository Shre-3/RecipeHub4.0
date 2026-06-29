import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ChefHat,
  Bookmark,
  ShoppingBasket,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onReset }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (onReset) onReset();
    navigate("/recipes");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === to
          ? "bg-[#1f5129] text-white"
          : "text-[#1f5129] hover:bg-[#1f5129]/10"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden xl:inline">{label}</span>
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-16 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              title="Back to recipe search"
              className={`flex flex-col items-center gap-0.5 rounded-md px-2 py-1 focus:outline-none transition-colors ${
                location.pathname === "/recipes"
                  ? "bg-[#1f5129]/10"
                  : "hover:bg-[#1f5129]/5"
              }`}
            >
              <ChefHat className="h-8 w-8 text-[#1f5129]" />
              <span className="text-xs font-semibold text-[#1f5129] leading-none">
                Home
              </span>
            </button>
            <span className="text-xl font-bold text-[#1f5129] hidden sm:inline">
              Recipe Hub
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {navLink("/pantry", "Pantry", ShoppingBasket)}
                {navLink("/meal-plan", "Meal Plan", CalendarDays)}
                {navLink("/bookmarks", "Bookmarks", Bookmark)}
                <span className="hidden lg:inline text-gray-700 text-sm">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-[#1f5129] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1f5129]/90"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-[#1f5129] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1f5129]/90"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[#1f5129] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1f5129]/90"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
