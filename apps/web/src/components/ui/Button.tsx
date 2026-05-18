import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  children,
  loading = false,
  variant = "primary",
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[6px] px-4 py-2 text-[15px] font-semibold leading-[1.33] transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#1877F2] text-white hover:bg-[#0D65D9] focus:ring-[#1877F2]",
    outline:
      "border border-[#CED0D4] text-[#1C1E21] bg-[#E4E6EB] hover:bg-[#D8DADF] focus:ring-[#CED0D4]",
    ghost:
      "text-[#606770] hover:bg-[#E4E6EB] focus:ring-[#CED0D4]",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}