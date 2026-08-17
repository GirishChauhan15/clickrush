import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Brain,
  Trophy,
  UserRound,
  LogOut,
  Menu,
  X,
  Gamepad,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f9ff] font-space text-slate-800">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg sm:h-12 sm:w-12 sm:rounded-2xl">
              <Brain className="text-white" size={22} />
            </div>

            <div className="min-w-0 select-none">
              <h1 className="truncate text-lg font-black sm:text-2xl">
                ClickRush
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Train Faster. Think Smarter.
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 md:flex lg:gap-8">
            <NavLink
              to="/play"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-semibold transition ${
                  isActive
                    ? "text-purple-600"
                    : "text-slate-600 hover:text-purple-600"
                }`
              }
            >
              <Gamepad size={18} />
              Play
            </NavLink>

            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-semibold transition ${
                  isActive
                    ? "text-purple-600"
                    : "text-slate-600 hover:text-purple-600"
                }`
              }
            >
              <Trophy size={16} />
              Leaderboard
            </NavLink>

            {user && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-semibold transition ${
                    isActive
                      ? "text-purple-600"
                      : "text-slate-600 hover:text-purple-600"
                  }`
                }
              >
                <UserRound size={16} />
                Profile
              </NavLink>
            )}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {user ? (
              <div className="flex min-w-0 items-center gap-2">
                <span className="max-w-[10rem] truncate text-sm font-semibold">
                  {user?.name?.length > 5
                    ? `${user.name.slice(0, 5)}...`
                    : user?.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="rounded-lg p-2 transition duration-150 hover:bg-purple-100/50 hover:text-purple-500"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <span className="rounded-lg border-2 border-gray-200 px-4 py-2 text-sm font-semibold transition-colors duration-150 hover:border-purple-100/50 hover:bg-purple-100/50 hover:text-purple-500">
                  Login
                </span>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            aria-label={
              mobileMenuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={mobileMenuOpen}
            className="rounded-lg p-2 transition hover:bg-purple-100/50 hover:text-purple-600 md:hidden"
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200/70 bg-white/90 px-3 py-3 backdrop-blur-xl sm:px-5 md:hidden">
            <nav className="flex flex-col gap-1">
              <NavLink to="/play" onClick={closeMobileMenu}>
                {({ isActive }) => (
                  <span
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-purple-50 text-purple-600"
                        : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    <Gamepad size={18} />
                    Play
                  </span>
                )}
              </NavLink>

              <NavLink to="/leaderboard" onClick={closeMobileMenu}>
                {({ isActive }) => (
                  <span
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-purple-50 text-purple-600"
                        : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    <Trophy size={18} />
                    Leaderboard
                  </span>
                )}
              </NavLink>

              {user && (
                <NavLink to="/profile" onClick={closeMobileMenu}>
                  {({ isActive }) => (
                    <span
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-purple-50 text-purple-600"
                          : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
                      }`}
                    >
                      <UserRound size={18} />
                      Profile
                    </span>
                  )}
                </NavLink>
              )}

              <div className="my-2 border-t border-slate-200" />

              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              ) : (
                <Link to="/login" onClick={closeMobileMenu}>
                  <span className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-purple-50 hover:text-purple-600">
                    Login
                  </span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}