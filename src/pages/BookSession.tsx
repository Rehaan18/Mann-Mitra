import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const counsellors = [
  { id: 1, name: "Dr. Priya Sharma", specialization: "Anxiety & Depression", qualifications: "M.D. Psychiatry, AIIMS", location: "Delhi", languages: ["English", "Hindi"], rating: 4.8 },
  { id: 2, name: "Dr. Raj Patel", specialization: "Stress Management", qualifications: "Ph.D. Psychology", location: "Mumbai", languages: ["English", "Hindi", "Gujarati"], rating: 4.9 },
  { id: 3, name: "Dr. Anjali Desai", specialization: "Academic Stress & Burnout", qualifications: "M.Phil Clinical Psychology", location: "Bangalore", languages: ["English", "Hindi", "Kannada"], rating: 4.7 },
  { id: 4, name: "Dr. Vikram Singh", specialization: "Relationship & Social Anxiety", qualifications: "Ph.D. Counselling Psychology", location: "Pune", languages: ["English", "Hindi", "Marathi"], rating: 4.8 },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-gray-100 text-gray-800",
};

const BookSession = () => {
  const { t } = useLanguage();
  const [selectedCounsellor, setSelectedCounsellor] = useState<typeof counsellors[0] | null>(null);
  const [sessionType, setSessionType] = useState("Online Session");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("10:00 AM");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("book");

  useEffect(() => {
    loadMySessions();
  }, []);

  const loadMySessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("session_bookings")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMySessions(data);
  };

  const handleBooking = async () => {
    if (!selectedCounsellor || !preferredDate) {
      toast.error("Please select a counsellor and date");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error } = await (supabase as any).from("session_bookings").insert({
        student_id: user.id,
        counsellor_name: selectedCounsellor.name,
        session_type: sessionType,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes: notes || null,
        status: "pending",
      } as any);
      if (error) throw error;

      toast.success("Session booked successfully! You'll receive a confirmation soon.");
      setSelectedCounsellor(null);
      setPreferredDate("");
      setNotes("");
      loadMySessions();
      setActiveTab("my-sessions");
    } catch (err: any) {
      toast.error(err.message || "Failed to book session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("bookSessionTitle")}</h1>
        <p className="text-muted-foreground">{t("bookSessionDesc")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="book">{t("bookSessionTab")}</TabsTrigger>
          <TabsTrigger value="my-sessions">My Sessions {mySessions.length > 0 && `(${mySessions.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {counsellors.map((counsellor) => (
                <Card
                  key={counsellor.id}
                  className={`cursor-pointer transition-colors ${selectedCounsellor?.id === counsellor.id ? "border-garden-blue" : ""}`}
                  onClick={() => setSelectedCounsellor(counsellor)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{counsellor.name}</CardTitle>
                        <CardDescription className="text-base mt-1">{counsellor.specialization}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1 bg-warning/20 px-2 py-1 rounded-md">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="text-sm font-medium text-warning">{counsellor.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{counsellor.qualifications}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" /><span>{counsellor.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Languages className="w-4 h-4" /><span>{counsellor.languages.join(", ")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader><CardTitle>{t("bookYourSession")}</CardTitle></CardHeader>
                <CardContent>
                  {selectedCounsellor ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t("selectedCounsellor")}</p>
                        <p className="text-lg font-semibold text-foreground">{selectedCounsellor.name}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("sessionType")}</label>
                        <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground">
                          <option>Online Session</option>
                          <option>In-Person Session</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("preferredDate")} *</label>
                        <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("preferredTime")}</label>
                        <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground">
                          <option>10:00 AM</option><option>11:00 AM</option>
                          <option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("notes")}</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notesPlaceholder")} className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm resize-none" rows={3} />
                      </div>
                      <Button className="w-full" onClick={handleBooking} disabled={submitting || !preferredDate}>
                        {submitting ? t("booking") : t("confirmBooking")}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">{t("selectCounsellor")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-sessions" className="mt-6">
          {mySessions.length === 0 ? (
            <Card><CardContent className="py-12"><p className="text-center text-muted-foreground">{t("noSessionsYet")}</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {mySessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{session.counsellor_name}</p>
                        <p className="text-sm text-muted-foreground">{session.session_type} · {new Date(session.preferred_date).toLocaleDateString()} at {session.preferred_time}</p>
                        {session.notes && <p className="text-sm text-muted-foreground italic">"{session.notes}"</p>}
                      </div>
                      <Badge className={statusColors[session.status] || "bg-gray-100 text-gray-800"}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookSession;
