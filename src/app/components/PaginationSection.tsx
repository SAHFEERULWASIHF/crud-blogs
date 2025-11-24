"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface PaginationSectionProps {
  currentPage: number;
  numOfPages: number;
  size: string;
  handleSizeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const PaginationSection: React.FC<PaginationSectionProps> = ({
  currentPage,
  numOfPages,
  size,
  handleSizeChange,
}) => {
  const router = useRouter();

  const handlePageClick = (pageNum: number) => {
    router.push(`/?page=${pageNum}&size=${size}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Show:
          </span>
          <div className="relative">
            <select
              value={size}
              onChange={handleSizeChange}
              className="appearance-none px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white pr-8"
            >
              <option value="3">3</option>
              <option value="6">6</option>
              <option value="9">9</option>
              <option value="15">15</option>
            </select>
            <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {numOfPages > 0 &&
            Array.from(Array(numOfPages).keys()).map((i) => (
              <button
                key={i}
                onClick={() => handlePageClick(i + 1)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 min-w-[40px] text-center ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {numOfPages || 1}
        </div>
      </div>
    </div>
  );
};

export default PaginationSection;
