"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, Variants } from "framer-motion";
import { FiMail, FiLock, FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import { AnimatedInput } from "./AnimatedInput";
import { cookieKeys } from "@/config/cookie.config";
import { LoginSchema } from "@/lib/user.schema";
import { LoginInput } from "@/types/types";
import api from "../../helpers/baseApi";

type LoginFormProps = {
  toggleView: () => void;
};

const formVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function LoginForm({ toggleView }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      try {
        const response = await api.post("/auth/login", data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data?.token) {
        Cookie.set(cookieKeys.USER_TOKEN, data.token, { expires: 7 });
        toast.success("Login successful! Redirecting...");
        router.push("/");
      } else {
        toast.error("No token received from server");
      }
    },
    onError: (error: any) => {
      console.error("Login error details:", error);

      if (error.code === "NETWORK_ERROR") {
        toast.error("Network error. Please check your connection.");
      } else if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        const message = error.response?.data?.message || "Login failed";
        toast.error(message);
      }
    },
  });
  const onSubmit = (data: LoginInput) => {
    console.log("Form data submitted:", data);
    mutation.mutate(data);
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-sm mx-auto p-8"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-300 text-sm">
            Sign in to your account to continue
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AnimatedInput
            icon={<FiMail size={18} />}
            register={register("email")}
            error={errors.email}
            type="email"
            placeholder="Email address"
          />
          <AnimatedInput
            icon={<FiLock size={18} />}
            register={register("password")}
            error={errors.password}
            type="password"
            placeholder="Password"
          />

          <motion.button
            type="submit"
            disabled={mutation.isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4 font-semibold text-white transition-all
                       hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200
                       disabled:cursor-not-allowed disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {mutation.isPending ? (
              <FiLoader className="animate-spin" size={20} />
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-100 text-sm">
            Don&apos;t have an account?{" "}
            <button
              onClick={toggleView}
              className="font-semibold text-indigo-300 hover:text-indigo-500 transition-colors duration-200"
            >
              Sign Up
            </button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
