import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils"; // Assuming you have a utility for merging class names

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#173f67] text-white hover:bg-[#14365a] dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-[#173f67] dark:focus:ring-blue-500",
        secondary:
          "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
        outline:
          "border border-[#173f67] text-[#173f67] hover:bg-[#173f67] hover:text-white dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-[#173f67] dark:focus:ring-blue-500",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-700",
        link: "text-[#173f67] underline-offset-4 hover:underline dark:text-blue-400 focus:ring-2 focus:ring-offset-2 focus:ring-[#173f67] dark:focus:ring-blue-500",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

const Button = ({ className, variant, size, ...props }) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};

export default Button;
