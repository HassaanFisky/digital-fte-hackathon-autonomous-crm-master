interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

export default function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeMap[size]} rounded-full border-slate-700 border-t-emerald-500 animate-spin`}
      />
      {label && (
        <p className="text-sm text-slate-400 font-medium tracking-wide">{label}</p>
      )}
    </div>
  );
}
