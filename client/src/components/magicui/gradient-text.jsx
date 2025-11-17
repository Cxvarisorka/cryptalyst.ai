import { cn } from "@/lib/utils";

export const GradientText = ({ children, className, from, via, to }) => {
  const gradientClass = from && to
    ? `bg-gradient-to-r from-${from} ${via ? `via-${via}` : ''} to-${to}`
    : "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600";

  return (
    <span
      className={cn(
        "bg-clip-text text-transparent",
        gradientClass,
        className
      )}
    >
      {children}
    </span>
  );
};
