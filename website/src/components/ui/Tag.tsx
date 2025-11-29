import { ReactNode } from "react";

export interface TagProps {
  children: ReactNode;
}

export const Tag: React.FC<TagProps> = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-100">
    {children}
  </span>
);
