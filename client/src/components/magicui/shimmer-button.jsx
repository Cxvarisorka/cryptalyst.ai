import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ShimmerButton = ({
  children,
  className,
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  borderRadius = "100px",
  shimmerDuration = "3s",
  background = "rgba(0, 0, 0, 1)",
  ...props
}) => {
  return (
    <motion.button
      style={{
        "--spread": "90deg",
        "--shimmer-color": shimmerColor,
        "--radius": borderRadius,
        "--speed": shimmerDuration,
        "--cut": shimmerSize,
        "--bg": background,
      }}
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] transition-transform duration-300 hover:scale-105",
        "before:absolute before:inset-0 before:overflow-hidden before:rounded-[inherit] before:[border-radius:var(--radius)] before:[mask:linear-gradient(white,transparent)] before:[background:linear-gradient(var(--spread),transparent,var(--shimmer-color),transparent)] before:[content:''] before:animate-shimmer",
        className
      )}
      {...props}
    >
      <span className="z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
