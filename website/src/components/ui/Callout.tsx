import { ReactNode } from "react";

export interface CalloutProps {
  title?: string;
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
}

const toneStyles = {
  info: "border-sky-500/50 bg-sky-500/5 text-sky-100",
  success: "border-emerald-500/50 bg-emerald-500/5 text-emerald-100",
  warning: "border-amber-500/50 bg-amber-500/5 text-amber-100",
  danger: "border-rose-500/50 bg-rose-500/5 text-rose-100",
};

export const Callout: React.FC<CalloutProps> = ({
  title,
  children,
  tone = "info",
}) => {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs shadow-sm shadow-slate-900 ${
        toneStyles[tone]
      }`}
    >
      {title && (
        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide">
          {title}
        </p>
      )}
      <div className="text-[0.8rem]">{children}</div>
    </div>
  );
};
