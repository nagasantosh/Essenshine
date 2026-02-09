import Link from "next/link";
import React from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-[hsl(var(--gold))/0.35]";

  const sizes: Record<Size, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-[hsl(var(--brand))] text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:opacity-95",
    secondary:
      "bg-[hsl(var(--surface))] text-[hsl(var(--text))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]",
    ghost:
      "bg-transparent text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))]",
  };

  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) return <Link className={cls} href={href}>{children}</Link>;

  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}