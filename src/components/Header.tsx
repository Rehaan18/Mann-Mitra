import { Globe, Sun, Moon, LogOut, Menu, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavContent } from "./Sidebar";
import { useState } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";

export const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useThemeContext();
  const { t, language, setLanguage, currentLanguage } = useLanguage();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-border z-50">
      <div className="flex items-center justify-between h-full px-6">

        {/* ── Left: logo + mobile menu ── */}
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-border">
              <nav className="p-4 space-y-2 h-full overflow-y-auto pt-10">
                <div className="flex items-center gap-3 px-4 pb-6">
                  <div className="w-8 h-8 relative flex-shrink-0">
                    <img
                      src="/mann-mitra-logo.jpg"
                      alt="Mann Mitra Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-lg font-bold text-garden-blue">{t("appName")}</h2>
                </div>
                <NavContent
                  userRole={null}
                  locationPath={location.pathname}
                  onNavClick={() => setIsOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="w-10 h-10 relative hidden lg:block">
            <img
              src="/mann-mitra-logo.jpg"
              alt="Mann Mitra Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-garden-blue">{t("appName")}</h1>
            <p className="text-xs text-muted-foreground">{t("tagline")}</p>
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-2">

          {/* ── LANGUAGE PICKER ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-garden-blue gap-1.5 px-2"
                title={t("changeLanguage")}
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold hidden sm:inline">
                  {currentLanguage.nativeName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("changeLanguage")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {lang.nativeName}
                      </p>
                      <p className="text-xs text-muted-foreground">{lang.name}</p>
                    </div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-garden-blue" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── THEME TOGGLE ── */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-garden-blue relative"
            title={theme === "dark" ? t("switchToLight") : t("switchToDark")}
          >
            <Sun className={`w-5 h-5 transition-all duration-300 ${
              theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0 absolute"
            }`} />
            <Moon className={`w-5 h-5 transition-all duration-300 ${
              theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0 absolute"
            }`} />
          </Button>

          {/* ── USER MENU ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-garden-purple text-white">U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
};
