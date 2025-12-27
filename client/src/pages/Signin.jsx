import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/magicui/fade-in";
import { useTranslation } from "react-i18next";
import OAuthButton from "@/components/auth/OAuthButton";
import { Mail, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function Signin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGithub, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError(t('auth.signin.errors.fillFields'));
      return;
    }

    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      // Check if verification is required
      if (result.requiresVerification) {
        setRequiresVerification(true);
        setVerificationEmail(result.email || formData.email);
      } else {
        setError(result.error);
      }
    }

    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);
    setError("");
    try {
      await axios.post("/auth/resend-verification", { email: verificationEmail });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification email");
    }
    setResending(false);
  };

  // Show verification required screen
  if (requiresVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center px-4 py-10">
        <FadeIn className="w-full max-w-md">
          <Card className="bg-card border-border/60">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold">
                {t('auth.verification.title')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('auth.verification.emailNotVerified')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('auth.verification.instructions')}
              </p>

              {resendSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md p-3 justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('auth.verification.resent')}
                </div>
              )}

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 text-center">
                  {error}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending ? t('auth.verification.resending') : t('auth.verification.resendButton')}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setRequiresVerification(false);
                  setError("");
                }}
              >
                {t('auth.verification.backToLogin')}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center px-4 py-10">
      <FadeIn className="w-full max-w-md">
        <Card className="bg-card border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              {t('auth.signin.title')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.signin.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <OAuthButton
                provider="google"
                onClick={loginWithGoogle}
                disabled={isLoading}
              />
              <OAuthButton
                provider="github"
                onClick={loginWithGithub}
                disabled={isLoading}
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('auth.signin.orContinue')}</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.signin.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.signin.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('auth.signin.buttonLoading') : t('auth.signin.button')}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {t('auth.signin.noAccount')}{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:underline font-medium"
                >
                  {t('auth.signin.signupLink')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
