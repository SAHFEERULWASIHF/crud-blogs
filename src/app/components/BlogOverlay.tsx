"use client";
import React, { useState, useEffect } from "react";
import UpdateBlogModal from "./UpdateBlogModal";
import { FiX, FiClock, FiEdit3, FiHash, FiUser } from "react-icons/fi";
import api from "../helpers/baseApi";
import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { cookieKeys } from "@/config/cookie.config";

interface BlogOverlayProps {
  blog: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface BlogWithAuthor {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  Author: Author;
}

interface DecodedToken {
  id: string;
  email: string;
  exp: number;
  iat: number;
}

const BlogOverlay: React.FC<BlogOverlayProps> = ({
  blog: initialBlog,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [blog, setBlog] = useState<BlogWithAuthor | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // get logged-in user's id from token
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

  useEffect(() => {
    const fetchBlogWithAuthor = async () => {
      if (isOpen && initialBlog.id) {
        setLoading(true);
        try {
          const response = await api.get(`/blog/${initialBlog.id}`);
          setBlog(response.data);
        } catch (err) {
          console.error("Failed to fetch blog details:", err);
          setBlog(initialBlog);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBlogWithAuthor();
  }, [isOpen, initialBlog]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      await api.delete(`/blog/${blog?.id}`);
      onClose();
      window.location.reload();
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const createdAt = blog?.createdAt ? formatDateTime(blog.createdAt) : null;
  const updatedAt =
    blog?.updatedAt && blog.updatedAt !== blog.createdAt
      ? formatDateTime(blog.updatedAt)
      : null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full p-6 text-center">
          <p>Loading blog details...</p>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  // check if logged user is the author
  const isAuthor = blog.authorId === currentUserId;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-5">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full relative overflow-y-auto max-h-[90vh]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 p-2 rounded-full shadow-md transition-all duration-300 flex items-center justify-center"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Blog Image */}
          {blog.image && (
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-t-2xl"
            />
          )}

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3">{blog.title}</h2>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {blog.Author && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full">
                  <FiUser className="w-4 h-4" />
                  By: {blog.Author.firstName} {blog.Author.lastName}
                </span>
              )}

              {blog.slug && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full">
                  <FiHash className="w-4 h-4" />
                  {blog.slug}
                </span>
              )}

              {createdAt && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
                  <FiClock className="w-4 h-4" />
                  Created: {createdAt}
                </span>
              )}

              {updatedAt && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-3 py-1 rounded-full">
                  <FiEdit3 className="w-4 h-4" />
                  Updated: {updatedAt}
                </span>
              )}
            </div>

            {/* Blog content */}
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {blog.content}
            </p>

            {/*  Show buttons only if the user is the author */}
            {isAuthor && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsUpdating(true)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
                >
                  Update
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isUpdating && (
        <UpdateBlogModal
          blog={blog}
          onClose={() => setIsUpdating(false)}
          onUpdated={() => {
            setIsUpdating(false);
            onClose();
            if (onDelete) onDelete();
          }}
        />
      )}
    </>
  );
};

export default BlogOverlay;
