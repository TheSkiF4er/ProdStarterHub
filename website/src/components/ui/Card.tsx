import { ReactNode } from "react";

export interface CardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = "",
}) => {
  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm shadow-slate-900 ${className}`}
    >
      {(title || subtitle) && (
        <header className="mb-2">
          {title && (
            <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-[0.7rem] text-slate-400">{subtitle}</p>
          )}
        </header>
      )}
      {children && <div className="flex-1 text-xs text-slate-200">{children}</div>}
      {footer && <footer className="mt-3 text-[0.7rem] text-slate-400">{footer}</footer>}
    </article>
  );
};
