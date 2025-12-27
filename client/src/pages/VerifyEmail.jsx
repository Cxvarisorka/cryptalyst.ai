import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/magicui/fade-in";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight, RefreshCw, Mail } from "lucide-react";
import api from "@/services/api";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Prevent duplicate API calls (React StrictMode calls useEffect twice)
    if (verificationAttempted.current) return;

    if (token) {
      verificationAttempted.current = true;
      verifyEmail();
    } else {
      setStatus("error");
      setMessage(t("auth.verification.invalidToken"));
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      if (response.data.success) {
        setStatus("success");
        setMessage(t("auth.verification.verifiedMessage"));
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || t("auth.verification.invalidToken"));
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-500/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-emerald-500/20 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
      </div>

      <FadeIn className="w-full max-w-lg relative z-10">
        {/* Verifying State */}
        {status === "verifying" && (
          <div className="text-center space-y-8">
            {/* Animated loader */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full border-4 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                <Mail className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("auth.verification.verifying")}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t("auth.verification.pleaseWait", "Please wait while we verify your email...")}
              </p>
            </div>

            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center space-y-8">
            {/* Success icon with celebration effect */}
            <div className="relative inline-flex items-center justify-center">
              {/* Celebration rings */}
              <div className="absolute w-40 h-40 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute w-36 h-36 rounded-full border border-emerald-500/30 animate-pulse" />

              {/* Sparkles */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-yellow-500 animate-pulse" style={{ animationDelay: '0.5s' }} />

              {/* Main icon */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-emerald-500">
                {t("auth.verification.verified")}
              </h1>
              <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                {message}
              </p>
            </div>

            {/* Success card */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{t("auth.verification.accountReady", "Your account is now ready to use")}</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              className="w-full max-w-xs mx-auto h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02]"
              onClick={() => navigate("/signin")}
            >
              {t("auth.verification.loginNow")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center space-y-8">
            {/* Error icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full bg-destructive/10 animate-pulse" />
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-destructive/80 to-destructive flex items-center justify-center shadow-lg shadow-destructive/20">
                <XCircle className="w-14 h-14 text-white" strokeWidth={2} />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-destructive">
                {t("auth.verification.verifyFailed")}
              </h1>
              <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                {message}
              </p>
            </div>

            {/* Error info card */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground">
                {t("auth.verification.errorHint", "The verification link may have expired or already been used. Please try signing in or request a new verification email.")}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12 border-border/60 hover:bg-muted/50"
                onClick={() => navigate("/signin")}
              >
                {t("auth.verification.backToLogin")}
              </Button>
              <Button
                size="lg"
                className="flex-1 h-12"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 w-4 h-4" />
                {t("auth.verification.tryAgain", "Try Again")}
              </Button>
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground/60">
            Cryptalyst
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
