import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Users, MessageSquare, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😰", label: "Stressed" },
  { emoji: "😟", label: "Anxious" },
  { emoji: "😌", label: "Calm" },
  { emoji: "💪", label: "Motivated" },
];

const CampusPulse = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("today");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [moodStats, setMoodStats] = useState<Record<string, number>>({});
  const [deptStats, setDeptStats] = useState<Record<string, Record<string, number>>>({});
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setAuthorized(true);
    });
  }, [navigate]);

  useEffect(() => {
    if (authorized) loadStats();
  }, [authorized, timeRange]);

  const loadStats = async () => {
    const now = new Date();
    let fromDate: string;
    if (timeRange === "today") fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    else if (timeRange === "week") { const d = new Date(now); d.setDate(d.getDate() - 7); fromDate = d.toISOString(); }
    else { const d = new Date(now); d.setMonth(d.getMonth() - 1); fromDate = d.toISOString(); }

    const { data, error } = await (supabase as any)
      .rpc('mood_logs_select', { from_date: fromDate }); // If you have a Postgres function, otherwise:

    // Or use the untyped client:
    // const { data, error } = await (supabase as any).from("mood_logs").select("mood, department, created_at").gte("created_at", fromDate);
    if (error || !Array.isArray(data)) return;

    // overall mood counts
    const counts: Record<string, number> = {};
    moods.forEach(m => counts[m.label] = 0);
    data.forEach(row => { if (counts[row.mood] !== undefined) counts[row.mood]++; });
    setMoodStats(counts);
    setTotalToday(data.length);

    // by department
    const byDept: Record<string, Record<string, number>> = {};
    data.forEach(row => {
      if (!row.department) return;
      if (!byDept[row.department]) { byDept[row.department] = {}; moods.forEach(m => byDept[row.department][m.label] = 0); }
      if (byDept[row.department][row.mood] !== undefined) byDept[row.department][row.mood]++;
    });
    setDeptStats(byDept);
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Get user's department for aggregation
      let department: string | null = null;
      if (user) {
        const { data: profile, error } = await supabase.from("profiles").select("department").eq("id", user.id).single();
        if (error) {
          department = null;
        } else {
          department = profile?.department || null;
        }
      }
      const { error } = await (supabase as any).from("mood_logs").insert({
        user_id: null,   // anonymous – don't store who logged it
        mood: selectedMood,
        department,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Mood submitted anonymously. Thank you!");
      loadStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit mood");
    } finally {
      setSubmitting(false);
    }
  };

  const topMood = Object.entries(moodStats).sort((a, b) => b[1] - a[1])[0];
  const totalMoods = Object.values(moodStats).reduce((a, b) => a + b, 0);

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("campusPulseTitle")}</h1>
        <p className="text-muted-foreground">{t("campusPulseDesc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t("totalResponses")} value={totalToday.toString()} icon={<Users className="w-6 h-6" />} variant="info" />
        <StatCard title={t("todaysResponses")} value={totalToday.toString()} icon={<MessageSquare className="w-6 h-6" />} variant="success" />
        <StatCard
          title={t("topMood")}
          value={topMood ? `${moods.find(m => m.label === topMood[0])?.emoji} ${topMood[0]}` : "—"}
          subtitle={`${topMood ? topMood[1] : 0} responses`}
          icon={<TrendingDown className="w-6 h-6" />}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("howAreYouFeeling")}</CardTitle>
          <CardDescription>{t("anonymousDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-4xl">✅</p>
              <p className="font-semibold text-foreground">{t("thankYouSharing")}</p>
              <p className="text-sm text-muted-foreground">{t("moodRecorded")}</p>
              <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setSelectedMood(null); }}>{t("submitAgain")}</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4">
                {moods.map((mood) => (
                  <button key={mood.label} onClick={() => setSelectedMood(mood.label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedMood === mood.label ? "border-garden-blue bg-garden-blue/10" : "border-border bg-card"}`}>
                    <span className="text-4xl">{mood.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{mood.label}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={!selectedMood || submitting} onClick={handleMoodSubmit}>
                {submitting ? t("submitting") : t("submitAnonymously")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Overall mood distribution */}
      {totalMoods > 0 && (
        <Card>
          <CardHeader><CardTitle>{t("overallMoodDist")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {moods.map(({ label, emoji }) => {
              const count = moodStats[label] || 0;
              const pct = totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{emoji} {label}</span>
                    <span className="font-medium text-foreground">{pct}% ({count})</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">{t("deptMoodOverview")}</h2>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="today">{t("today")}</TabsTrigger>
              <TabsTrigger value="week">{t("week")}</TabsTrigger>
              <TabsTrigger value="month">{t("month")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {Object.keys(deptStats).length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">{t("noDeptData")}</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(deptStats).map(([dept, moodsData]) => {
              const total = Object.values(moodsData).reduce((a, b) => a + b, 0);
              return (
                <Card key={dept}>
                  <CardHeader><CardTitle className="text-lg">{dept}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {moods.map(({ label }) => {
                      const count = moodsData[label] || 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-foreground">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusPulse;
