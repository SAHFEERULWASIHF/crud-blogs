"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => setIsLoginView((prev) => !prev);

  return (
    <main
      className="flex min-h-screen items-center justify-center 
             bg-[url('https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg')]
             bg-cover bg-center bg-no-repeat p-4"
    >
      {/* Optional overlay (for readability) */}
      <div className="absolute inset-0 bg-black/40"></div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card with modern shadow and subtle border */}
        <div className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-sm shadow-2xl shadow-indigo-100/50 border border-gray-100">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 to-transparent" />

          <div className="relative">
            <AnimatePresence mode="wait">
              {isLoginView ? (
                <LoginForm key="login" toggleView={toggleView} />
              ) : (
                <RegisterForm key="register" toggleView={toggleView} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Additional decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        ></motion.div>
      </motion.div>
    </main>
  );
}
