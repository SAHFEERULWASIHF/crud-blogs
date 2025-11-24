"use client";
import React, { useState } from "react";
import api from "../helpers/baseApi";

interface UpdateBlogModalProps {
  blog: any;
  onClose: () => void;
  onUpdated: () => void;
}

const UpdateBlogModal: React.FC<UpdateBlogModalProps> = ({
  blog,
  onClose,
  onUpdated,
}) => {
  const [formData, setFormData] = useState({
    title: blog.title,
    content: blog.content,
    image: blog.image || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`blog/${blog.id}`, formData);
      onUpdated();
      window.location.reload();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[60] p-5">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-lg"
      >
        <h3 className="text-xl font-bold mb-4">Update Blog</h3>

        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 mb-3 dark:bg-gray-800 dark:border-gray-700"
          placeholder="Title"
          required
        />

        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 mb-3 h-32 dark:bg-gray-800 dark:border-gray-700"
          placeholder="Content"
          required
        />

        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 mb-3 dark:bg-gray-800 dark:border-gray-700"
          placeholder="Image URL"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBlogModal;
