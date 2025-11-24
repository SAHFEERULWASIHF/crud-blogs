import React from "react";

// utils/highlight.ts
export const highlightText = (
  text: string,
  searchTerm: string,
): React.ReactNode => {
  if (!searchTerm.trim() || !text) return text;

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part)
      ? React.createElement(
          "mark",
          {
            key: index,
            className: "bg-yellow-200 dark:bg-yellow-500/50 px-1 rounded",
          },
          part,
        )
      : part,
  );
};
