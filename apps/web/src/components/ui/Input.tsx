import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-[13px] font-medium text-[#1C1E21]">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-[6px] border px-3 py-2 text-[15px] outline-none transition leading-[1.5]
          focus:ring-2 focus:ring-[#1877F2] focus:border-[#1877F2]
          disabled:bg-[#F0F2F5] disabled:cursor-not-allowed
          ${error ? "border-[#FA3E3E] bg-red-50" : "border-[#CED0D4] bg-white"}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#FA3E3E]">{error}</p>}
    </div>
  );
}