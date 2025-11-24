"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiFileText,
  FiArrowLeft,
  FiLogOut,
} from "react-icons/fi";

import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { cookieKeys } from "@/config/cookie.config";
import api from "@/app/helpers/baseApi";
import LogoutConfirmModal from "@/app/components/LogoutConfirmModal";
import DeleteUserModal from "@/app/components/DeleteUserModal";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    Blogs: number;
  };
}

interface DecodedToken {
  id: string;
  email: string;
  exp: number;
  iat: number;
}

const UserDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Get logged-in user's id from token
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

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get(`user/${userId}`);
        setUser(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        });
      } catch (err: any) {
        console.error("Failed to fetch user:", err);
        setError(err.response?.data?.error || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
    setMobileMenuOpen(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await api.put(`/user/${userId}`, formData);

      // Safely update user state, preserving _count if not in response
      setUser((prevUser) => ({
        ...response.data,
        // If _count is not in response, keep the previous _count value
        _count: response.data._count || prevUser?._count || { Blogs: 0 },
      }));

      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update failed:", err);
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`user/${userId}`);

      // If user deletes their own account
      if (currentUserId === userId) {
        Cookie.remove(cookieKeys.USER_TOKEN);

        // Redirect to home after a short delay to ensure cookie removal
        setTimeout(() => {
          router.push("/");
          window.location.reload();
        }, 500);
      } else {
        router.push("/users");
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError(err.response?.data?.error || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = () => {
    Cookie.remove(cookieKeys.USER_TOKEN);
    router.push("/");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading user data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <p className="text-red-600 dark:text-red-400 text-lg">
              User not found
            </p>
            <button
              onClick={handleBack}
              className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentUser = currentUserId === user.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header with Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
          {/* Left Section */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-2 lg:py-3
             bg-white/70 dark:bg-gray-800/60 
             backdrop-blur-md border border-gray-200 dark:border-gray-700 
             text-gray-800 dark:text-gray-200 font-medium 
             rounded-full shadow-sm 
             transition-all duration-300 
             hover:bg-white dark:hover:bg-gray-700 
             active:scale-95"
            >
              <FiArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Title */}
            <div className="text-left">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                User Profile
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Manage your account information and preferences
              </p>
            </div>
          </div>

          {/* Action Buttons — now always visible */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {isCurrentUser && !isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 
                  bg-indigo-600 text-white rounded-lg 
                  hover:bg-indigo-700 active:scale-95 
                  transition-all duration-300 text-sm sm:text-base"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 
                 bg-gray-600 text-white rounded-lg 
                 hover:bg-gray-700 active:scale-95 
                 transition-all duration-300 text-sm sm:text-base"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-lg">
            <div className="space-y-2">
              {isCurrentUser && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm sm:text-base">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm sm:text-base">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-indigo-100 text-sm sm:text-base truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Mobile Edit Button */}
              {isCurrentUser && !isEditing && (
                <div className="sm:hidden">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {isEditing ? (
              // Edit Form
              <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg sm:rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>{updating ? "Updating..." : "Save Changes"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              // Display User Information
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl">
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Full Name
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl">
                    <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl">
                    <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Member Since
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                        {formatDateTime(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl">
                    <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Blog Posts
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?._count?.Blogs || 0} posts
                      </p>
                    </div>
                  </div>
                </div>

                {user.updatedAt !== user.createdAt && (
                  <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg sm:rounded-xl">
                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">
                      Last updated: {formatDateTime(user.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Danger Zone - Only show for current user */}
            {isCurrentUser && !isEditing && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mb-4 text-xs sm:text-sm">
                    Once you delete your account, there is no going back. This
                    will permanently delete your profile and all your blog
                    posts.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>{deleting ? "Deleting..." : "Delete Account"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={() => {
          handleLogout();
          setShowLogoutModal(false);
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
      <DeleteUserModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleting}
      />
    </div>
  );
};

export default UserDetailsPage;
