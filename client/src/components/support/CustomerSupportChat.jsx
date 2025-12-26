import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Customer Support Chat Widget using Tawk.to
 *
 * To configure:
 * 1. Create a free account at https://www.tawk.to
 * 2. Get your Property ID and Widget ID from the Tawk.to dashboard
 * 3. Set VITE_TAWKTO_PROPERTY_ID and VITE_TAWKTO_WIDGET_ID in your .env file
 *
 * The widget will appear in the bottom right corner of the page.
 * If credentials are not configured, a placeholder widget will be shown.
 */
export default function CustomerSupportChat() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTawkLoaded, setIsTawkLoaded] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID;
    const widgetId = import.meta.env.VITE_TAWKTO_WIDGET_ID;

    // Don't load Tawk.to if credentials are not configured
    if (!propertyId || !widgetId) {
      return;
    }

    // Check if script already exists
    if (document.getElementById('tawkto-script')) {
      setIsTawkLoaded(true);
      return;
    }

    // Tawk.to configuration
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Customize widget position to not overlap with OnboardingWidget
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: 'br',
          xOffset: 20,
          yOffset: 20
        },
        mobile: {
          position: 'br',
          xOffset: 10,
          yOffset: 80
        }
      }
    };

    // Create and load the Tawk.to script
    const script = document.createElement('script');
    script.id = 'tawkto-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    script.onload = () => {
      setIsTawkLoaded(true);
    };

    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('tawkto-script');
      if (existingScript) {
        existingScript.remove();
      }
      delete window.Tawk_API;
      delete window.Tawk_LoadStart;
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the message to your backend
    console.log('Support message:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setFormData({ name: '', email: '', message: '' });
    }, 2000);
  };

  // If Tawk.to is loaded, don't render our placeholder
  if (isTawkLoaded) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .chat-bounce:hover {
          animation: chatBounce 0.5s ease-in-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .chat-window {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}</style>

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[85] h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center chat-bounce transition-all duration-200 hover:scale-110 sm:bottom-6 sm:right-6"
          style={{ bottom: '24px', right: '24px' }}
          aria-label={t('support.openChat', 'Open chat')}
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[95] w-80 sm:w-96 chat-window" style={{ bottom: '24px', right: '24px' }}>
          <Card className="bg-card/95 backdrop-blur border-primary/20 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t('support.title', 'Customer Support')}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t('support.subtitle', 'We typically reply within minutes')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {submitted ? (
                <div className="py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">{t('support.messageSent', 'Message sent!')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('support.willReply', "We'll get back to you soon")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Input
                      placeholder={t('support.namePlaceholder', 'Your name')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder={t('support.emailPlaceholder', 'Your email')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder={t('support.messagePlaceholder', 'How can we help you?')}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full h-9">
                    <Send className="h-4 w-4 mr-2" />
                    {t('support.send', 'Send Message')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
