import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Only show modal if user is not logged in
    if (!user) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleGetStarted = () => {
    handleClose();
    navigate('/pricing');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Black overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={handleClose}
        style={{
          animation: 'fadeIn 0.3s ease-out forwards'
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'modalSlideUp 0.4s ease-out forwards'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-muted transition-all duration-200 hover:scale-110 z-10"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-5 sm:p-6 md:p-8 lg:p-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-full mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">
                Limited Time Offer
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground leading-tight">
              Start Your Free Trial
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed">
              Get <span className="font-bold text-foreground">3 days free</span> access to premium crypto analysis, advanced indicators, and AI-powered insights
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
              <div className="p-3 sm:p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all duration-200">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-foreground">Real-time Analysis</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">Track 250+ cryptocurrencies</p>
              </div>
              <div className="p-3 sm:p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all duration-200">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-foreground">AI-Powered Insights</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">Advanced market predictions</p>
              </div>
              <div className="p-3 sm:p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all duration-200">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-foreground">Premium Tools</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">Unlimited portfolio tracking</p>
              </div>
            </div>

            {/* Pricing highlight */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 sm:p-5 md:p-6 mb-5 sm:mb-6 md:mb-8">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">Starting at just</p>
              <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">$10</span>
                <span className="text-sm sm:text-base md:text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-xs sm:text-sm text-primary font-semibold mt-1.5 sm:mt-2">
                3-day free trial • Cancel anytime
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gradient-money hover:opacity-90 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                onClick={handleGetStarted}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="transition-all duration-200 text-sm sm:text-base py-2.5 sm:py-3 w-full sm:w-auto"
                onClick={handleClose}
              >
                Maybe Later
              </Button>
            </div>

            {/* Fine print */}
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-3.5 sm:mt-5 leading-relaxed">
              No credit card required for trial • Full access to all features
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
