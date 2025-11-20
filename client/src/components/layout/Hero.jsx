import { FadeIn } from "@/components/magicui/fade-in";
import { GradientText } from "@/components/magicui/gradient-text";

/**
 * Dynamic Hero Component
 *
 * @param {string} title - Main title text
 * @param {string} subtitle - Subtitle/description text
 * @param {Array} icons - Array of icon components to display (e.g., [{ Icon: TrendingUp, gradient: 'from-orange-500 to-yellow-500' }])
 * @param {boolean} showSingleIcon - If true, shows a single large icon. If false, shows multiple smaller icons
 * @param {React.Node} children - Optional children (buttons, actions, etc.)
 */
export default function Hero({
  title,
  subtitle,
  icons = [],
  showSingleIcon = false,
  children
}) {
  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b border-border/40">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-20" />

      <div className="container mx-auto px-4 py-20 md:py-28 relative">
        <FadeIn className="text-center">
          {/* Icons Section */}
          {icons.length > 0 && (
            <div className="mb-6 inline-block">
              {showSingleIcon ? (
                // Single Large Icon
                (() => {
                  const { Icon, gradient } = icons[0];
                  return (
                    <div className={`w-20 h-20 mx-auto rounded-full ${gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  );
                })()
              ) : (
                // Multiple Small Icons
                <div className="flex gap-3 justify-center mb-4">
                  {icons.map((iconConfig, index) => {
                    const { Icon, gradient } = iconConfig;
                    return (
                      <div
                        key={index}
                        className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center transition-all duration-500`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-7xl font-bold mb-6">
            <GradientText>{title}</GradientText>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>

          {/* Action Buttons / Children */}
          {children && (
            <div className="flex gap-4 justify-center flex-wrap">
              {children}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
