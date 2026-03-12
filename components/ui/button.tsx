"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  leftIcon?: ReactNode;
}

const variantClassnames: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost"
};

export function Button({
  children,
  variant = "primary",
  loading,
  leftIcon,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${variantClassnames[variant]} ${className}`}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        leftIcon && <span className="mr-2">{leftIcon}</span>
      )}
      {children}
    </button>
  );
}

