import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const stressQuestions = [
  { id: 1, question: "Over the past week, how often have you been bothered by feeling nervous, anxious, or on edge?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 2, question: "How often have you felt that you couldn't stop or control worrying?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 3, question: "How often have you had trouble relaxing?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 4, question: "How often have you felt so restless that it's hard to sit still?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 5, question: "How often have you become easily annoyed or irritable?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 6, question: "How often have you felt afraid as if something awful might happen?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  { id: 7, question: "How much have these problems affected your ability to do schoolwork or get along with others?", options: ["Not at all", "Somewhat", "Very much", "Extremely"] },
];

const scoreMap: Record<string, number> = {
  "Not at all": 0, "Several days": 1, "More than half the days": 2, "Nearly every day": 3,
  "Somewhat": 1, "Very much": 2, "Extremely": 3,
};

function getSeverity(score: number) {
  if (score <= 4) return { label: "Minimal", color: "bg-green-100 text-green-800" };
  if (score <= 9) return { label: "Mild", color: "bg-yellow-100 text-yellow-800" };
  if (score <= 14) return { label: "Moderate", color: "bg-orange-100 text-orange-800" };
  return { label: "Severe", color: "bg-red-100 text-red-800" };
}

const WellnessTools = () => {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; severity: string; color: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("stress_assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setHistory(data);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const score = Object.values(answers).reduce((sum, ans) => sum + (scoreMap[ans] ?? 0), 0);
      const { label, color } = getSeverity(score);

      const { error } = await (supabase as any).from("stress_assessments").insert({
        user_id: user.id,
        answers: answers as any,
        score,
        severity: label,
      });
      if (error) throw error;

      setResult({ score, severity: label, color });
      toast.success("Assessment submitted successfully!");
      loadHistory();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  // Breathing timer
  useEffect(() => {
    if (!breathingActive) return;
    const phases: Array<{ phase: "inhale" | "hold" | "exhale"; duration: number }> = [
      { phase: "inhale", duration: 4 },
      { phase: "hold", duration: 7 },
      { phase: "exhale", duration: 8 },
    ];
    let phaseIdx = 0;
    let remaining = phases[0].duration;
    setBreathingPhase(phases[0].phase);
    setCountdown(phases[0].duration);

    const interval = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        phaseIdx = (phaseIdx + 1) % phases.length;
        remaining = phases[phaseIdx].duration;
        setBreathingPhase(phases[phaseIdx].phase);
        setCountdown(phases[phaseIdx].duration);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("wellnessToolsTitle")}</h1>
        <p className="text-muted-foreground">{t("wellnessToolsDesc")}</p>
      </div>

      <Tabs defaultValue="assessment" className="w-full">
        <TabsList>
          <TabsTrigger value="assessment">{t("stressAssessment")}</TabsTrigger>
          <TabsTrigger value="breathing">{t("breathingExercise")}</TabsTrigger>
          {history.length > 0 && <TabsTrigger value="history">{t("myHistory")}</TabsTrigger>}
        </TabsList>

        <TabsContent value="assessment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("stressAssessmentTitle")}</CardTitle>
              <CardDescription>{t("stressAssessmentDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl">
                    {result.severity === "Minimal" ? "😊" : result.severity === "Mild" ? "😐" : result.severity === "Moderate" ? "😟" : "😰"}
                  </div>
                  <h2 className="text-2xl font-bold">Score: {result.score} / 21</h2>
                  <Badge className={result.color + " text-base px-4 py-1"}>{result.severity} Anxiety</Badge>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {result.severity === "Minimal" && "Great! Your stress levels are well-managed."}
                    {result.severity === "Mild" && "You're experiencing some stress. Consider relaxation techniques."}
                    {result.severity === "Moderate" && "Moderate anxiety detected. We recommend booking a counselling session."}
                    {result.severity === "Severe" && "Please consider reaching out to a counsellor or mental health professional."}
                  </p>
                  <Button onClick={() => { setResult(null); setAnswers({}); }}>{t("takeAgain")}</Button>
                </div>
              ) : (
                <>
                  {stressQuestions.map((q) => (
                    <div key={q.id} className="space-y-3 pb-6 border-b border-border last:border-0">
                      <p className="font-medium text-foreground">{q.id}. {q.question}</p>
                      <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}>
                        {q.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${q.id}-${idx}`} />
                            <Label htmlFor={`q${q.id}-${idx}`} className="cursor-pointer">{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <Button className="w-full" disabled={Object.keys(answers).length < stressQuestions.length || submitting} onClick={handleSubmit}>
                    {submitting ? t("submitting") : t("submitAssessment")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breathing" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("breathingTitle")}</CardTitle>
                <CardDescription>{t("breathingDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Inhale quietly through your nose for 4 seconds</li>
                  <li>Hold your breath for 7 seconds</li>
                  <li>Exhale completely through your mouth for 8 seconds</li>
                  <li>Repeat the cycle</li>
                </ol>
                <div className="flex gap-3">
                  <Button onClick={() => setBreathingActive(true)} className="flex-1" disabled={breathingActive}>{t("startExercise")}</Button>
                  <Button onClick={() => { setBreathingActive(false); setBreathingPhase("inhale"); setCountdown(4); }} variant="outline" className="flex-1">Reset</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center p-8">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathingActive
                    ? breathingPhase === "inhale" ? "scale-100 bg-garden-blue/20"
                    : breathingPhase === "hold" ? "scale-100 bg-garden-purple/20"
                    : "scale-75 bg-success/20"
                    : "scale-90 bg-muted"
                }`} />
                <div className="relative z-10 text-center">
                  <p className="text-5xl font-bold text-foreground mb-2">{breathingActive ? countdown : "—"}</p>
                  <p className="text-lg text-muted-foreground capitalize">{breathingActive ? t(breathingPhase) : t("clickStart")}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {history.length > 0 && (
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader><CardTitle>{t("assessmentHistory")}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((item) => {
                    const { color } = getSeverity(item.score);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">{t("score")}: {item.score} / 21</p>
                          <p className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge className={color}>{item.severity}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default WellnessTools;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "student" | "counsellor" | "administrator";
          student_id: string;
          // ... (rest of the fields)
          updated_at: string;
        };
        Insert: {
          // ... (insert fields)
        };
        Update: {
          // ... (update fields)
        };
        Relationships: [];
      };
      stress_assessments: {  // Add this new table
        Row: {
          id: string;
          user_id: string;
          answers: Record<string, any>;  // Based on your code, it's an object of answers
          score: number;
          severity: string;
          created_at: string;  // Assuming this is auto-added by Supabase
        };
        Insert: {
          user_id: string;
          answers: Record<string, any>;
          score: number;
          severity: string;
          // created_at is optional if auto-generated
        };
        Update: {
          // Define updatable fields if needed, e.g., score, severity
          score?: number;
          severity?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stress_assessments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
