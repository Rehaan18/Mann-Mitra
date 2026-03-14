import { Home, MessageCircle, Calendar, Flower2, TrendingUp, Users, BookOpen, Heart, User, Settings, History, Briefcase, Shield, FileText, BarChart3, UserCheck, ClipboardList, Salad } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export const NavContent = ({
  userRole,
  locationPath,
  onNavClick
}: {
  userRole: string | null;
  locationPath: string;
  onNavClick?: () => void;
}) => {
  const { t } = useLanguage();

  const studentNavigation = [
    { name: t("dashboard"),      href: "/dashboard",      icon: Home },
    { name: t("aiSupport"),      href: "/ai-support",     icon: MessageCircle },
    { name: t("bookSession"),    href: "/book-session",   icon: Calendar },
    { name: t("moodGarden"),     href: "/mood-garden",    icon: Flower2 },
    { name: t("studyBuddy"),     href: "/study-buddy",    icon: Users },
    { name: t("resources"),      href: "/resources",      icon: BookOpen },
    { name: t("peerSupport"),    href: "/peer-support",   icon: Users },
    { name: t("wellnessTools"),  href: "/wellness-tools", icon: Heart },
    { name: t("nutritionMood"),  href: "/nutrition",      icon: Salad },
    { name: t("history"),        href: "/history",        icon: History },
    { name: t("profile"),        href: "/profile",        icon: User },
    { name: t("settings"),       href: "/settings",       icon: Settings },
  ];

  const counsellorNavigation = [
    { name: t("dashboard"),        href: "/dashboard",                    icon: Home },
    { name: t("myClients"),        href: "/counsellor/clients",           icon: Users },
    { name: t("appointments"),     href: "/counsellor/appointments",      icon: Calendar },
    { name: t("sessionNotes"),     href: "/counsellor/notes",             icon: ClipboardList },
    { name: t("clientProgress"),   href: "/counsellor/progress",          icon: TrendingUp },
    { name: t("resources"),        href: "/resources",                    icon: BookOpen },
    { name: t("mySchedule"),       href: "/counsellor/schedule",          icon: Calendar },
    { name: t("profile"),          href: "/profile",                      icon: User },
    { name: t("settings"),         href: "/settings",                     icon: Settings },
  ];

  const adminNavigation = [
    { name: t("dashboard"),         href: "/dashboard",                   icon: Home },
    { name: t("campusPulse"),       href: "/campus-pulse",                icon: TrendingUp },
    { name: t("userManagement"),    href: "/admin/users",                 icon: Users },
    { name: t("counsellorReview"),  href: "/admin/counsellor-review",     icon: UserCheck },
    { name: t("analytics"),         href: "/admin/analytics",             icon: BarChart3 },
    { name: t("reports"),           href: "/admin/reports",               icon: FileText },
    { name: t("systemSettings"),    href: "/admin/system-settings",       icon: Settings },
    { name: t("profile"),           href: "/profile",                     icon: User },
  ];

  const getNavigation = () => {
    switch (userRole) {
      case 'counsellor':   return counsellorNavigation;
      case 'administrator': return adminNavigation;
      default:             return studentNavigation;
    }
  };

  const navigation = getNavigation();

  const portalLabel =
    userRole === 'counsellor'   ? t("counsellorPortal") :
    userRole === 'administrator' ? t("adminPortal") :
    t("studentPortal");

  return (
    <>
      {/* Role indicator */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2">
          {userRole === 'counsellor'   && <Briefcase className="w-4 h-4 text-garden-purple" />}
          {userRole === 'administrator' && <Shield    className="w-4 h-4 text-garden-green" />}
          {(!userRole || userRole === 'student') && <User className="w-4 h-4 text-garden-blue" />}
          <span className="text-xs font-medium text-muted-foreground">{portalLabel}</span>
        </div>
      </div>

      {navigation.map((item) => {
        const isActive = locationPath === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-sidebar-accent text-garden-blue"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        );
      })}
    </>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          setUserRole(profile?.role || 'student');
        }
      } catch {
        setUserRole('student');
      } finally {
        setLoading(false);
      }
    };

    getUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-border overflow-y-auto">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-garden-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-border overflow-y-auto">
      <nav className="p-4 space-y-2">
        <NavContent userRole={userRole} locationPath={location.pathname} />
      </nav>
    </aside>
  );
};

export { Sidebar };
