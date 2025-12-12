import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import Modal from './Modal';

export default function Navbar() {
  const { currentTheme } = useTheme();
  const { addToast } = useToast();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        credentials: 'include',
      });

      if (response.ok) {
        addToast('Logged out successfully', 'success');
        window.location.href = '/login';
      } else {
        addToast('Logout failed', 'error');
      }
    } catch (error) {
      addToast('Logout failed', 'error');
    }
  };

  return (
    <>
      <nav
        className="shadow-lg sticky top-0 z-40"
        style={{ backgroundColor: currentTheme.colors.sidebar }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <span
                  className="font-bold text-2xl cursor-pointer hover:opacity-80 transition btn-hover-lift"
                  style={{ color: currentTheme.colors.primary }}
                >
                  🎬 AnimeStream
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/characters">
                <span
                  className="hover:opacity-80 transition cursor-pointer font-medium"
                  style={{ color: currentTheme.colors.primary }}
                >
                  Characters
                </span>
              </Link>
              <Link href="/account">
                <span
                  className="hover:opacity-80 transition cursor-pointer font-medium"
                  style={{ color: currentTheme.colors.primary }}
                >
                  Account
                </span>
              </Link>
              <Link href="/admin">
                <span
                  className="hover:opacity-80 transition cursor-pointer font-medium"
                  style={{ color: currentTheme.colors.primary }}
                >
                  Admin
                </span>
              </Link>
              <button
                onClick={() => setLogoutModal(true)}
                className="px-4 py-2 rounded-lg font-semibold transition btn-hover-lift"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  color: currentTheme.colors.sidebar,
                }}
              >
                Logout
              </button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: currentTheme.colors.primary }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-4 space-y-3 slide-in-up">
              <Link href="/characters">
                <div
                  className="block py-2 hover:opacity-80 font-medium"
                  style={{ color: currentTheme.colors.primary }}
                >
                  Characters
                </div>
              </Link>
              <Link href="/account">
                <div
                  className="block py-2 hover:opacity-80 font-medium"
                  style={{ color: currentTheme.colors.primary }}
                >
                  Account
                </div>
              </Link>
              <Link href="/admin">
                <div
                  className="block py-2 hover:opacity-80 font-medium"
                  style={{ color: currentTheme.colors.primary }}
                >
                  Admin
                </div>
              </Link>
              <button
                onClick={() => setLogoutModal(true)}
                className="w-full px-4 py-2 rounded-lg font-semibold transition"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  color: currentTheme.colors.sidebar,
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <Modal
        isOpen={logoutModal}
        title="Logout Confirmation"
        message="Are you sure you want to logout? Your session will be terminated."
        onConfirm={handleLogout}
        onCancel={() => setLogoutModal(false)}
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
}
