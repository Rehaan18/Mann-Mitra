import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatbotUI } from "@/components/ChatbotUI";

const AISupport = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          setUserName(profile?.full_name ?? user.email?.split("@")[0]);
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-garden-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    // Fill the full remaining height of the page (accounts for header + sidebar)
    <div className="h-[calc(100vh-8rem)] min-h-0 flex flex-col">
      <ChatbotUI userId={userId ?? undefined} userName={userName} />
    </div>
  );
};

export default AISupport;
