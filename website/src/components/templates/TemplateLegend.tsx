export const TemplateLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-slate-400">
    <span className="font-semibold text-slate-300">Legend:</span>
    <LegendDot className="bg-sky-400" label="Stable / production-ready" />
    <LegendDot className="bg-emerald-400" label="Beta / usable with care" />
    <LegendDot className="bg-amber-400" label="Alpha / early-stage" />
    <LegendDot className="bg-rose-400" label="Experimental" />
  </div>
);

const LegendDot: React.FC<{ className: string; label: string }> = ({
  className,
  label,
}) => (
  <span className="inline-flex items-center gap-1">
    <span
      className={`inline-block h-2 w-2 rounded-full ${className}`}
      aria-hidden="true"
    />
    <span>{label}</span>
  </span>
);
