import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/magicui/fade-in";
import { useTranslation } from "react-i18next";
import OAuthButton from "@/components/auth/OAuthButton";

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError(t('auth.signup.errors.fillFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.signup.errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.signup.errors.passwordLength'));
      return;
    }

    setIsLoading(true);

    const result = await signup(formData.name, formData.email, formData.password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center px-4 py-10">
      <FadeIn className="w-full max-w-md">
        <Card className="bg-card border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              {t('auth.signup.title')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('auth.signup.description')}
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
                <span className="bg-card px-2 text-muted-foreground">{t('auth.signup.orContinue')}</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.signup.name')}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.signup.email')}</Label>
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
                <Label htmlFor="password">{t('auth.signup.password')}</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.signup.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
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
                {isLoading ? t('auth.signup.buttonLoading') : t('auth.signup.button')}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {t('auth.signup.haveAccount')}{" "}
                <Link
                  to="/signin"
                  className="text-primary hover:underline font-medium"
                >
                  {t('auth.signup.signinLink')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
