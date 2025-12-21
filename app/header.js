"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isAdmin } from "./authUtils";
import "./globals.css";

const Header = () => {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const adminStatus = isAdmin();
  useEffect(() => {
    setIsAdminUser(adminStatus);
  }, [adminStatus]);

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Yogesh Singh BJP</h2>
        {isAdminUser && (
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
              <Link href="/entry" className="hover:text-gray-200 transition">
                Entry
              </Link>
              {/* <Link
                href="/admin/ward"
                className="hover:text-gray-200 transition"
              >
                Map
              </Link> */}
              <Link
                href="/admin/users"
                className="hover:text-gray-200 transition"
              >
                Users
              </Link>
            </nav>
          </div>
        )}
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="bg-blue-700 mt-3 flex flex-col gap-4 p-4 md:hidden">
          <Link
            href="/entry"
            className="hover:text-gray-200 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Entry
          </Link>
          <Link
            href="/admin/users"
            className="hover:text-gray-200 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Users
          </Link>
        </nav>
      )}
    </header>
  );
};
export default Header;
