"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

interface DeleteUserModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-80 sm:w-96 text-center border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                <FiAlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Account?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This will permanently delete your account and all your blogs.
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteUserModal;
