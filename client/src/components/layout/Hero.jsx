import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";

/**
 * Modern Hero Component with Configurable Alignment
 *
 * @param {string} title - Main title text
 * @param {string} subtitle - Subtitle/description text
 * @param {Array} icons - Array of icon components to display (e.g., [{ Icon: TrendingUp, gradient: 'from-orange-500 to-yellow-500' }])
 * @param {boolean} showSingleIcon - If true, shows a single large icon. If false, shows multiple smaller icons
 * @param {string} align - Text alignment: "center" (for home page) or "left" (for other pages). Default: "center"
 * @param {string} size - Header size: "large" (for home page) or "medium" (for other pages). Default: "large"
 * @param {React.Node} children - Optional children (buttons, actions, etc.)
 */
export default function Hero({
  title,
  subtitle,
  icons = [],
  showSingleIcon = false,
  align = "center",
  size = "large",
  children
}) {
  const isCenter = align === "center";
  const isLarge = size === "large";

  return (
    <section className="relative bg-background border-b border-border/30">
      {/* Minimalist subtle accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Static spacing: pt-16 for consistent spacing from header */}
      <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16 relative">
        <FadeIn className={`${isCenter ? "text-center max-w-4xl mx-auto" : "text-left max-w-6xl"}`}>
          {/* Icons Section - Simplified */}
          {icons.length > 0 && (
            <div className="mb-6">
              {showSingleIcon ? (
                // Single Icon
                (() => {
                  const { Icon, gradient } = icons[0];
                  return (
                    <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-sm ${isCenter ? "mx-auto" : ""}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  );
                })()
              ) : (
                // Multiple Icons
                <div className={`flex gap-2 ${isCenter ? "justify-center" : "justify-start"}`}>
                  {icons.map((iconConfig, index) => {
                    const { Icon, gradient } = iconConfig;
                    return (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center shadow-sm`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Title - Responsive sizing based on size prop */}
          <h1 className={`${isLarge ? "text-3xl md:text-5xl lg:text-6xl" : "text-2xl md:text-4xl lg:text-4xl"} font-bold mb-4 tracking-tight`}>
            <GradientText>{title}</GradientText>
          </h1>

          {/* Subtitle - Compact */}
          <p className={`text-base md:text-lg text-muted-foreground mb-8 ${isCenter ? "max-w-2xl mx-auto" : "max-w-3xl"} leading-relaxed`}>
            {subtitle}
          </p>

          {/* Action Buttons */}
          {children && (
            <div className={`flex gap-3 flex-wrap ${isCenter ? "justify-center" : "justify-start"}`}>
              {children}
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
