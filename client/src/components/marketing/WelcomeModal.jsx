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
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes featureFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes buttonPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(var(--primary), 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(var(--primary), 0);
          }
        }
      `}</style>

      {/* Black overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={handleClose}
        style={{
          animation: 'fadeIn 0.5s ease-out forwards'
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 rounded-2xl shadow-2xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-all duration-300 hover:scale-110 z-10"
            style={{
              animation: 'fadeIn 0.6s ease-out forwards',
              animationDelay: '0.7s',
              opacity: 0
            }}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-8 md:p-12 text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
              style={{
                animation: 'fadeIn 0.6s ease-out forwards',
                animationDelay: '0.1s',
                opacity: 0
              }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Limited Time Offer
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
              style={{
                animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                animationDelay: '0.1s',
                opacity: 0
              }}
            >
              Start Your Free Trial
            </h2>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto"
              style={{
                animation: 'fadeIn 0.6s ease-out forwards',
                animationDelay: '0.15s',
                opacity: 0
              }}
            >
              Get <span className="font-bold text-foreground">3 days free</span> access to premium crypto analysis, advanced indicators, and AI-powered insights
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div
                className="p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  animationDelay: '0.2s',
                  opacity: 0
                }}
              >
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Real-time Analysis</p>
                <p className="text-xs text-muted-foreground mt-1">Track 250+ cryptocurrencies</p>
              </div>
              <div
                className="p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  animationDelay: '0.3s',
                  opacity: 0
                }}
              >
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">AI-Powered Insights</p>
                <p className="text-xs text-muted-foreground mt-1">Advanced market predictions</p>
              </div>
              <div
                className="p-4 bg-primary/5 border border-primary/10 rounded-xl hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  animationDelay: '0.4s',
                  opacity: 0
                }}
              >
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">Premium Tools</p>
                <p className="text-xs text-muted-foreground mt-1">Unlimited portfolio tracking</p>
              </div>
            </div>

            {/* Pricing highlight */}
            <div
              className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8"
              style={{
                animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                animationDelay: '0.5s',
                opacity: 0
              }}
            >
              <p className="text-sm text-muted-foreground mb-2">Starting at just</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-foreground">$10</span>
                <span className="text-xl text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-primary font-semibold mt-2">
                3-day free trial • Cancel anytime
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-gradient-money hover:opacity-90 text-white font-semibold px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={handleGetStarted}
                style={{
                  animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards, buttonPulse 2s 0.8s infinite',
                  animationDelay: '0.6s',
                  opacity: 0
                }}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="transition-all duration-300 hover:scale-105"
                onClick={handleClose}
                style={{
                  animation: 'modalSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  animationDelay: '0.65s',
                  opacity: 0
                }}
              >
                Maybe Later
              </Button>
            </div>

            {/* Fine print */}
            <p
              className="text-xs text-muted-foreground mt-6"
              style={{
                animation: 'fadeIn 0.6s ease-out forwards',
                animationDelay: '0.7s',
                opacity: 0
              }}
            >
              No credit card required for trial • Full access to all features
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
