import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  children: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/40 hover:bg-sky-400 border border-transparent",
  secondary:
    "border border-slate-700 bg-slate-900 text-slate-100 shadow-sm shadow-slate-900/40 hover:border-slate-500",
  ghost: "text-slate-200 hover:bg-slate-900 border border-transparent",
  outline:
    "border border-slate-600 bg-transparent text-slate-100 hover:border-sky-500",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  href,
  children,
  className = "",
  ...rest
}) => {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
};
