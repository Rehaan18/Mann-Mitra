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

          // Pull display name from your profiles table (same pattern as Dashboard)
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          // Use full_name from profile, fall back to the part before @ in email
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
          <div className="w-16 h-16 border-4 border-garden-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <ChatbotUI userId={userId ?? undefined} userName={userName} />
    </div>
  );
};

export default AISupport;
