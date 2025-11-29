import { ReactNode } from "react";

type Tone = "default" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  default: "bg-slate-800 text-slate-100 border-slate-700",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  danger: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/40",
};

export const Badge: React.FC<BadgeProps> = ({ tone = "default", children }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${toneClasses[tone]}`}
  >
    {children}
  </span>
);
