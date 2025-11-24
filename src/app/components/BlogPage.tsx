"use client";
import React, { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { cookieKeys } from "@/config/cookie.config";
import { FiCheck, FiRefreshCw } from "react-icons/fi";

// Add this interface for the token
interface DecodedToken {
  id: string;
  email: string;
  exp: number;
  iat: number;
}

const BlogPage = () => {
  const [blogs, _setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showMyBlogs, setShowMyBlogs] = useState(false);

  // Get current user ID from token (same logic as in BlogOverlay)
  useEffect(() => {
    const token = Cookie.get(cookieKeys.USER_TOKEN);
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setCurrentUserId(decoded.id);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // Filter blogs based on showMyBlogs state
  useEffect(() => {
    if (showMyBlogs && currentUserId) {
      const myBlogs = blogs.filter((blog) => blog.authorId === currentUserId);
      setFilteredBlogs(myBlogs);
    } else {
      setFilteredBlogs(blogs);
    }
  }, [showMyBlogs, currentUserId, blogs]);

  const toggleMyBlogs = () => {
    setShowMyBlogs(!showMyBlogs);
  };

  return (
    <div>
      {/* Show My Blogs Tick / Undo Button */}
      <div className="mb-4 flex items-center">
        <button
          onClick={toggleMyBlogs}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            showMyBlogs
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {showMyBlogs ? (
            <FiCheck className="w-5 h-5" />
          ) : (
            <FiRefreshCw className="w-5 h-5" />
          )}
          {showMyBlogs ? "My Blogs" : "All Blogs"}
        </button>

        {/* Optional: Show filter status */}
        {showMyBlogs && currentUserId && (
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
            Showing only your blogs
          </span>
        )}
      </div>

      {/* Render your blogs list using filteredBlogs */}
      {filteredBlogs.map((blog) => (
        <div key={blog.id}>{blog.title}</div>
      ))}
    </div>
  );
};

export default BlogPage;
