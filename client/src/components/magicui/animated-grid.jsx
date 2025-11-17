import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedGrid = ({
  className,
  children,
  columns = 3,
  staggerDelay = 0.1
}) => {
  return (
    <div
      className={cn(
        "grid gap-4",
        `grid-cols-1 md:grid-cols-${columns}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export const AnimatedGridItem = ({
  children,
  index = 0,
  staggerDelay = 0.1,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        delay: index * staggerDelay,
        duration: 0.5,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
