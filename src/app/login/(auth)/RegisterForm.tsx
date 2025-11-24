"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, Variants } from "framer-motion";
import { FiMail, FiLock, FiUser, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { AnimatedInput } from "./AnimatedInput";
import { UserInput } from "@/types/types";
import { UserSchema } from "@/lib/user.schema";
import api from "../../helpers/baseApi";
import { cookieKeys } from "@/config/cookie.config";
import cookie from "js-cookie";
import { useRouter } from "next/navigation";

type RegisterFormProps = {
  toggleView: () => void;
};

const formVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function RegisterForm({ toggleView }: RegisterFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(UserSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: UserInput) => {
      return api.post("auth/register", data);
    },
    onSuccess: (response) => {
      const token = response.data.token;
      cookie.set(cookieKeys.USER_TOKEN, token, { expires: 7 });
      toast.success("Account created! Redirecting...");
      router.push("/");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    },
  });

  const onSubmit = (data: UserInput) => {
    mutation.mutate(data);
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-sm mx-auto p-5 "
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
            Create Account
          </h2>
          <p className="text-gray-300 text-sm">Join us today and get started</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <AnimatedInput
            icon={<FiUser size={18} />}
            register={register("firstName")}
            error={errors.firstName}
            type="text"
            placeholder="First name"
          />
          <AnimatedInput
            icon={<FiUser size={18} />}
            register={register("lastName")}
            error={errors.lastName}
            type="text"
            placeholder="Last name"
          />
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
              "Create Account"
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-100 text-sm">
            Already have an account?{" "}
            <button
              onClick={toggleView}
              className="font-semibold text-indigo-300 hover:text-indigo-500 transition-colors duration-200"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
