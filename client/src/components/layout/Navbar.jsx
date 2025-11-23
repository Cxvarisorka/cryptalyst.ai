import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/magicui/gradient-text";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Menu, X, Coins, LogOut, User, Moon, Sun, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: t('nav.home'), path: "/" },
    ...(isAuthenticated ? [{ name: t('nav.dashboard'), path: "/dashboard" }] : []),
    { name: t('nav.pricing'), path: "/pricing" },
    { name: t('nav.about'), path: "/about" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">
              <GradientText>Cryptalyst.ai</GradientText>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative",
                  isActive(link.path) 
                    ? "text-primary after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-gradient-money" 
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme & Language Group */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full hover:bg-primary/10"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <LanguageSwitcher />
            </div>

            {/* Divider */}
            {isAuthenticated && (
              <div className="h-8 w-px bg-border/60 mx-1" />
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-money flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown size={14} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal truncate">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/signin")}
                  className="hover:bg-primary/10"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  className="bg-gradient-money hover:opacity-90 transition-opacity shadow-sm"
                  onClick={() => navigate("/signup")}
                >
                  {t('nav.getStarted')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <LanguageSwitcher />
            <button
              className="text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/60">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-2",
                    isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-border/60 pt-4 mt-2"></div>
                  <div className="flex items-center gap-3 px-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-money flex items-center justify-center">
                        <User size={18} className="text-white" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/settings");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-start gap-2 px-2"
                  >
                    <Settings size={16} />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 px-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <div className="border-t border-border/60 pt-4 mt-2"></div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/signin");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    className="w-full bg-gradient-money hover:opacity-90 transition-opacity shadow-sm"
                    onClick={() => {
                      navigate("/signup");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t('nav.getStarted')}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
