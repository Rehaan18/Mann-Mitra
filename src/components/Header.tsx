import { Globe, Sun, Moon, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavContent } from "./Sidebar";
import { useState } from "react";
import { useThemeContext } from "../contexts/ThemeContext";

export const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useThemeContext();

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
                  <h2 className="text-lg font-bold text-garden-blue">Mann Mitra</h2>
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
            <h1 className="text-xl font-bold text-garden-blue">Mann Mitra</h1>
            <p className="text-xs text-muted-foreground">Your Mental Health Companion</p>
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="flex items-center gap-2">
          {/* Language button (placeholder) */}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:text-garden-blue"
          >
            <Globe className="w-5 h-5" />
            <span className="sr-only">Change language</span>
          </Button>

          {/* ── THEME TOGGLE BUTTON ── */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:text-garden-blue relative group"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {/* Sun icon — visible in dark mode */}
            <Sun
              className={`w-5 h-5 transition-all duration-300 ${
                theme === "dark"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 rotate-90 scale-0 absolute"
              }`}
            />
            {/* Moon icon — visible in light mode */}
            <Moon
              className={`w-5 h-5 transition-all duration-300 ${
                theme === "light"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-0 absolute"
              }`}
            />
            <span className="sr-only">
              {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </span>
          </Button>

          {/* Avatar / user menu */}
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
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
