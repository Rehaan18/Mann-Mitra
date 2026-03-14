import { Home, MessageCircle, Calendar, Flower2, TrendingUp, Users, BookOpen, Heart, User, Settings, History, Briefcase, Shield, FileText, BarChart3, UserCheck, ClipboardList, Salad } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Export the navigation content so it can be reused in the mobile menu (Header.tsx)
export const NavContent = ({
  userRole,
  locationPath,
  onNavClick
}: {
  userRole: string | null;
  locationPath: string;
  onNavClick?: () => void;
}) => {
  // Student Navigation
  const studentNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "AI Support", href: "/ai-support", icon: MessageCircle },
    { name: "Book Session", href: "/book-session", icon: Calendar },
    { name: "Mood Garden", href: "/mood-garden", icon: Flower2 },
    { name: "Study Buddy", href: "/study-buddy", icon: Users },
    { name: "Resources", href: "/resources", icon: BookOpen },
    { name: "Peer Support", href: "/peer-support", icon: Users },
    { name: "Wellness Tools", href: "/wellness-tools", icon: Heart },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "History", href: "/history", icon: History },
    { name: "Nutrition & Mood", href: "/nutrition", icon: Salad },
  ];

  // Counsellor Navigation
  const counsellorNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "My Clients", href: "/counsellor/clients", icon: Users },
    { name: "Appointments", href: "/counsellor/appointments", icon: Calendar },
    { name: "Session Notes", href: "/counsellor/notes", icon: ClipboardList },
    { name: "Client Progress", href: "/counsellor/progress", icon: TrendingUp },
    { name: "Resources", href: "/resources", icon: BookOpen },
    { name: "My Schedule", href: "/counsellor/schedule", icon: Calendar },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Administrator Navigation
  const adminNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Campus Pulse", href: "/campus-pulse", icon: TrendingUp },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Counsellor Review", href: "/admin/counsellor-review", icon: UserCheck },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "System Settings", href: "/admin/system-settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
  ];

  // Select navigation based on role
  const getNavigation = () => {
    if (!userRole) return studentNavigation;

    switch (userRole) {
      case 'counsellor':
        return counsellorNavigation;
      case 'administrator':
        return adminNavigation;
      case 'student':
      default:
        return studentNavigation;
    }
  };

  const navigation = getNavigation();

  return (
    <>
      {/* Role indicator */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2">
          {userRole === 'counsellor' && <Briefcase className="w-4 h-4 text-garden-purple" />}
          {userRole === 'administrator' && <Shield className="w-4 h-4 text-garden-green" />}
          {userRole === 'student' && <User className="w-4 h-4 text-garden-blue" />}
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {userRole || 'student'} Portal
          </span>
        </div>
      </div>

      {navigation.map((item) => {
        const isActive = locationPath === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-sidebar-accent text-garden-blue"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-5 h-5" />
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
        console.log("Sidebar - Current user:", user);

        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          console.log("Sidebar - Profile data:", profile);
          console.log("Sidebar - Profile error:", error);

          if (profile && profile.role) {
            setUserRole(profile.role);
            console.log("Sidebar - User role set to:", profile.role);
          } else {
            console.log("Sidebar - No role found, defaulting to student");
            setUserRole('student');
          }
        }
      } catch (error) {
        console.error('Sidebar - Error loading profile:', error);
        setUserRole('student');
      } finally {
        setLoading(false);
      }
    };

    getUserRole();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar border-r border-border overflow-y-auto">
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-garden-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
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