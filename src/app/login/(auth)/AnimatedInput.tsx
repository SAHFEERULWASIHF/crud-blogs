"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

type AnimatedInputProps = {
  icon: ReactNode;
  register: UseFormRegisterReturn;
  error: FieldError | undefined;
  type?: string;
  placeholder: string;
};

const inputVariants = {
  rest: {
    scale: 1.0,
  },
  hover: {
    scale: 1.01,
  },
  focus: {
    scale: 1.01,
    boxShadow: "0px 4px 20px rgba(99, 102, 241, 0.15)",
  },
};

export function AnimatedInput({
  icon,
  register,
  error,
  type = "text",
  placeholder,
}: AnimatedInputProps) {
  return (
    <motion.div
      className="w-full"
      variants={inputVariants}
      initial="rest"
      whileHover="hover"
      whileFocus="focus"
    >
      <div className="relative flex w-full flex-col">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 group-focus-within:text-indigo-500">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          {...register}
          className={`
            w-full rounded-2xl border-2 bg-white py-4 pl-12 pr-6
            text-gray-800 placeholder-gray-400 transition-all duration-200
            focus:outline-none focus:border-indigo-400 focus:bg-white
            font-medium
            ${
              error
                ? "border-red-400 focus:border-red-400"
                : "border-gray-200 focus:border-indigo-400"
            }
          `}
        />
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 text-sm text-red-500 font-medium"
          >
            {error.message}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
