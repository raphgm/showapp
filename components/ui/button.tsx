import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  size,
  className = "",
  ...props
}) => {
  let base = "font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500";
  let variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    destructive: "bg-rose-600 text-white hover:bg-rose-700",
  };
  let sizes = {
    sm: "px-4 py-2 text-sm",
    icon: "w-10 h-10 flex items-center justify-center",
  };
  return (
    <button
      className={[
        base,
        variants[variant],
        size ? sizes[size] : "px-6 py-3 text-base",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
};
