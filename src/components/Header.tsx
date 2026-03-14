import { Globe, Sun, Moon, LogOut, Menu, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <header className="fixed top-0 left-0 right-0 h-16 z-50
      bg-sidebar/80 backdrop-blur-md
      border-b border-garden-blue/20
      shadow-[0_1px_30px_rgba(59,130,246,0.08)]">

      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-garden-blue/50 to-transparent" />

      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* ── Left: logo + title ── */}
        <div className="flex items-center gap-3">

          {/* Mobile menu trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-garden-blue">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-border">
              <nav className="p-4 space-y-2 h-full overflow-y-auto pt-10">
                <div className="flex items-center gap-3 px-4 pb-6">
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-garden-blue/40 shadow-[0_0_12px_rgba(59,130,246,0.3)] flex-shrink-0">
                    <img src="/mann-mitra-logo.jpg" alt="Mann Mitra Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-lg font-bold text-garden-blue">{t("appName")}</h2>
                </div>
                <NavContent userRole={null} locationPath={location.pathname} onNavClick={() => setIsOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo — circular with glow */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-garden-blue/20 blur-md scale-125" />
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-garden-blue/50 shadow-[0_0_16px_rgba(59,130,246,0.4)]">
                <img src="/mann-mitra-logo.jpg" alt="Mann Mitra Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-garden-blue to-garden-purple bg-clip-text text-transparent leading-tight">
                {t("appName")}
              </h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">{t("tagline")}</p>
            </div>
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-1">

          {/* Language picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"
                className="text-muted-foreground hover:text-garden-blue hover:bg-garden-blue/10 gap-1.5 px-2.5 rounded-xl transition-all"
                title={t("changeLanguage")}>
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold hidden sm:inline">{currentLanguage.nativeName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 max-h-80 overflow-y-auto bg-card/95 backdrop-blur-md border-border shadow-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t("changeLanguage")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}
                  className="flex items-center justify-between cursor-pointer hover:bg-garden-blue/10">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{lang.nativeName}</p>
                      <p className="text-xs text-muted-foreground">{lang.name}</p>
                    </div>
                  </div>
                  {language === lang.code && <Check className="w-4 h-4 text-garden-blue" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}
            className="text-muted-foreground hover:text-garden-blue hover:bg-garden-blue/10 rounded-xl transition-all relative"
            title={theme === "dark" ? t("switchToLight") : t("switchToDark")}>
            <Sun className={`w-4 h-4 transition-all duration-300 ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0 absolute"}`} />
            <Moon className={`w-4 h-4 transition-all duration-300 ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0 absolute"}`} />
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* User avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-garden-purple/50 transition-all">
                {/* Glow behind avatar */}
                <div className="absolute inset-0 rounded-full bg-garden-purple/20 blur-sm" />
                <Avatar className="relative h-9 w-9 ring-2 ring-garden-purple/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  <AvatarImage src="/mann-mitra-logo.jpg" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-garden-purple to-garden-blue text-white text-sm font-bold">U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border shadow-xl w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}
                className="hover:bg-garden-blue/10 cursor-pointer">
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}
                className="hover:bg-garden-blue/10 cursor-pointer">
                {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}
                className="text-destructive hover:bg-red-500/10 cursor-pointer">
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
