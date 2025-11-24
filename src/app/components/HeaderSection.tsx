"use client";
import React, { useState, useEffect } from "react";
import { FiUser, FiLogIn } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { cookieKeys } from "../../config/cookie.config";
import { MdBiotech } from "react-icons/md";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { jwtDecode } from "jwt-decode";

interface HeaderSectionProps {
  onAddBlog: () => void;
}

interface DecodedToken {
  id: string;
  email: string;
  exp: number;
  iat: number;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ onAddBlog }) => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = Cookie.get(cookieKeys.USER_TOKEN);
    setLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    Cookie.remove(cookieKeys.USER_TOKEN);
    window.location.reload();
    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const getUserId = () => {
    const token = Cookie.get(cookieKeys.USER_TOKEN);
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.id;
      } catch (err) {
        console.error("Invalid token:", err);
        return null;
      }
    }
    return null;
  };

  const handleUserClick = () => {
    const userId = getUserId();
    if (userId) router.push(`/user/${userId}`);
    else router.push("/login");
  };

  if (!isClient) return null; // prevents hydration mismatch

  return (
    <div className="w-full max-w-7xl mx-auto mb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 lg:p-6 relative">
        {/* Logo + Title */}
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="relative group">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-indigo-500/25">
              <MdBiotech className="text-2xl text-white transition-transform group-hover:scale-110" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              TECH-
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 bg-size-200 animate-gradient">
                TALKS
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-light">
              Discover amazing insights
            </p>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3 lg:-translate-x-8">
          {loggedIn && (
            <button
              onClick={onAddBlog}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-white 
               bg-gradient-to-r from-indigo-600 to-purple-700 
               rounded-xl transition-all duration-300
               hover:from-indigo-700 hover:to-purple-800 hover:scale-105 hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5 stroke-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Post
            </button>
          )}

          {loggedIn ? (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-3 font-semibold text-white bg-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-6 py-3 font-semibold text-white 
               bg-green-500 rounded-xl transition-all duration-300 
               hover:bg-green-600"
            >
              <FiLogIn className="w-5 h-5" />
              Login
            </button>
          )}
        </div>

        {/* User Profile Button (Mobile & Desktop) */}
        <div className="absolute top-6 right-4 lg:top-8 lg:-right-1 z-50">
          <button
            onClick={handleUserClick}
            className={` flex items-center justify-center p-2 lg:p-3 rounded-full transition-all duration-200 ${
              loggedIn
                ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-indigo-100 dark:hover:bg-gray-800"
                : "bg-blue-500 text-white hover:bg-blue-600 lg:hidden"
            }`}
            title={loggedIn ? "User Details" : "Login to your account"}
          >
            {loggedIn ? (
              <FiUser className="w-5 h-5" />
            ) : (
              <FiLogIn className="w-6 h-6 lg:hidden" />
            )}
          </button>
        </div>
      </div>

      {/* Floating Action Buttons */}
      {loggedIn ? (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={onAddBlog}
            className="w-14 h-14 flex items-center justify-center rounded-full shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:opacity-90 transition-all duration-300"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={handleLogin}
            className="hidden w-14 h-14  items-center justify-center rounded-full shadow-2xl bg-gradient-to-r from-green-600 to-emerald-700 hover:opacity-90 transition-all duration-300"
            title="Login"
          >
            <FiLogIn className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {loggedIn && (
        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onConfirm={() => {
            handleLogout();
            setShowLogoutModal(false);
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};

export default HeaderSection;
