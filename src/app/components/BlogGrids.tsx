"use client";
import React, { useState, useEffect } from "react";
import BlogOverlay from "./BlogOverlay";
import { highlightText } from "../utils/highlight";
import { FiUser } from "react-icons/fi";
import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { cookieKeys } from "@/config/cookie.config";

interface BlogGridProps {
  blogs: any;
  isLoading: boolean;
  refetch?: () => void;
  searchTerm?: string;
}

interface DecodedToken {
  id: string;
  email: string;
  exp: number;
  iat: number;
}

const BlogGrid: React.FC<BlogGridProps> = ({
  blogs,
  isLoading,
  refetch,
  searchTerm = "",
}) => {
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showMyBlogs, setShowMyBlogs] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState<any>(blogs);

  // Get current user ID from token
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
    if (showMyBlogs && currentUserId && blogs?.items) {
      const myBlogs = blogs.items.filter(
        (blog: any) => blog.authorId === currentUserId,
      );
      setFilteredBlogs({ ...blogs, items: myBlogs });
    } else {
      setFilteredBlogs(blogs);
    }
  }, [showMyBlogs, currentUserId, blogs]);

  const toggleMyBlogs = () => {
    setShowMyBlogs(!showMyBlogs);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!blogs || blogs.items.length === 0) return null;

  const displayBlogs = filteredBlogs?.items || [];

  return (
    <>
      {/* Header with Filter Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {showMyBlogs ? "My Blogs" : "All Blogs"}
          {displayBlogs.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({displayBlogs.length}{" "}
              {displayBlogs.length === 1 ? "blog" : "blogs"})
            </span>
          )}
        </h1>

        {/* Show My Blogs Button - Only show if user is logged in */}
        {currentUserId && (
          <div className="flex items-center gap-4">
            <span
              className={`text-sm font-medium ${!showMyBlogs ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
            >
              All Blogs
            </span>

            <button
              onClick={toggleMyBlogs}
              className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                  ${showMyBlogs ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}
                `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${showMyBlogs ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>

            <span
              className={`text-sm font-medium ${showMyBlogs ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
            >
              My Blogs
              {showMyBlogs && (
                <span className="ml-1 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {displayBlogs.length}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Filter Status */}
      {showMyBlogs && currentUserId && (
        <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <p className="text-indigo-700 dark:text-indigo-300 text-sm">
            📝 Showing only your blogs ({displayBlogs.length} found)
          </p>
        </div>
      )}

      {/* Blogs Grid */}
      {displayBlogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
            📝
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {showMyBlogs
              ? "You haven't created any blogs yet."
              : "No blogs found."}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {showMyBlogs
              ? "Create your first blog to see it here!"
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBlogs.map((blog: any) => (
            <article
              key={blog.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 relative overflow-hidden">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-indigo-300 dark:text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Your Blog Badge */}
                {blog.authorId === currentUserId && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                    Your Blog
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {highlightText(blog.title, searchTerm)}
                </h3>

                {/* Author display section */}
                {blog.Author && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <FiUser className="w-4 h-4 text-indigo-500" />
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                        blog.authorId === currentUserId
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {blog.Author.firstName} {blog.Author.lastName}
                      {blog.authorId === currentUserId && " (You)"}
                    </span>
                  </div>
                )}

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {highlightText(blog.content || blog.description, searchTerm)}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {blog.slug}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBlog(blog);
                      setIsOverlayOpen(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    Read more
                    <svg
                      className="w-4 h-4 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Full Overlay for Blog Details */}
      {selectedBlog && (
        <BlogOverlay
          blog={selectedBlog}
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
          onDelete={refetch}
        />
      )}
    </>
  );
};

export default BlogGrid;
