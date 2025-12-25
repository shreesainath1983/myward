"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isAdmin } from "./authUtils";
import "./globals.css";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const adminStatus = isAdmin();
  const [isHideMenu, setIsHideMenu] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    setIsAdminUser(adminStatus);
  }, [adminStatus]);

  useEffect(() => {
    setIsHideMenu(pathname === "/login");
  }, [pathname]);

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Yogesh Singh BJP</h2>
        {!isHideMenu && (
          <div>
            {/* Hamburger Icon */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col gap-1 md:hidden"
              aria-label="Toggle menu"
            >
              <span className="w-6 h-0.5 bg-white"></span>
              <span className="w-6 h-0.5 bg-white"></span>
              <span className="w-6 h-0.5 bg-white"></span>
            </button>

            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-6">
              {isAdminUser && (
                <>
                  <Link
                    href="/entry"
                    className="hover:text-gray-200 transition"
                  >
                    Voter Search
                  </Link>
                  <Link
                    href="/admin/dashboard"
                    className="hover:text-gray-200 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/users"
                    className="hover:text-gray-200 transition"
                  >
                    Users
                  </Link>
                </>
              )}
              <div
                className="hover:text-gray-200 transition cursor-pointer"
                title="Logout"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-logout"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                  <path d="M9 12h12l-3 -3" />
                  <path d="M18 15l3 -3" />
                </svg>
              </div>
            </nav>
          </div>
        )}
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="bg-blue-700 mt-3 flex flex-col gap-4 p-4 md:hidden">
          {isAdminUser && (
            <>
              <Link
                href="/entry"
                className="hover:text-gray-200 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Entry
              </Link>
              <Link
                href="/admin/dashboard"
                className="hover:text-gray-200 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="hover:text-gray-200 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Users
              </Link>
            </>
          )}
          <div
            className="hover:text-gray-200 transition cursor-pointer flex items-center gap-2"
            title="Logout"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("user");
                window.location.href = "/login";
              }
            }}
          >
            <span>Logout</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-logout"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
              <path d="M9 12h12l-3 -3" />
              <path d="M18 15l3 -3" />
            </svg>
          </div>
        </nav>
      )}
    </header>
  );
};
export default Header;
