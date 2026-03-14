import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic, MicOff, Send, CheckCircle2, AlertTriangle, AlertCircle, FileText, Brain, Heart, Leaf, Activity, Utensils, Download } from "lucide-react";
import { generateDSMReport, type DataSources, type DiagnosticReport, type DiagnosticFlag } from "@/lib/dsmDiagnosticEngine";
import { fetchAllDiagnosticData, checkDataReadiness } from "@/lib/diagnosticDataService";

// ─── GAD-7 QUESTIONS ────────────────────────────────────────────────────────
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

// ─── SEVERITY ICON ──────────────────────────────────────────────────────────
function SeverityIcon({ severity }: { severity: string }) {
  if (severity === 'severe' || severity === 'moderate') return <AlertCircle className="w-5 h-5 text-red-500" />;
  if (severity === 'mild') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  return <CheckCircle2 className="w-5 h-5 text-green-500" />;
}

// ─── SCORE RING ─────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#eab308' : score >= 35 ? '#f97316' : '#ef4444';
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let cur = 0;
    const step = score / 40;
    const t = setInterval(() => {
      cur = Math.min(cur + step, score);
      setDisplayed(Math.round(cur));
      if (cur >= score) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={size*0.08} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*0.08}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black" style={{ color, fontSize: size * 0.22 }}>{displayed}</span>
        <span className="text-muted-foreground" style={{ fontSize: size * 0.1 }}>/100</span>
      </div>
    </div>
  );
}

// ─── DIAGNOSTIC FLAG CARD ────────────────────────────────────────────────────
function FlagCard({ flag }: { flag: DiagnosticFlag }) {
  const [expanded, setExpanded] = useState(false);
  const severityClasses: Record<string, string> = {
    severe: 'border-red-300 bg-red-50',
    moderate: 'border-orange-300 bg-orange-50',
    mild: 'border-amber-200 bg-amber-50',
    none: 'border-green-200 bg-green-50',
  };
  const badgeClasses: Record<string, string> = {
    severe: 'bg-red-100 text-red-700',
    moderate: 'bg-orange-100 text-orange-700',
    mild: 'bg-amber-100 text-amber-700',
    none: 'bg-green-100 text-green-700',
  };

  return (
    <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${severityClasses[flag.severity] || severityClasses.none}`}
      onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <SeverityIcon severity={flag.severity} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground text-sm">{flag.name}</p>
              <Badge className={`text-xs ${badgeClasses[flag.severity] || badgeClasses.none}`}>
                {flag.severity === 'none' ? 'No concern' : flag.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">DSM-5 {flag.code}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={flag.score} className="h-1.5 w-24" />
              <span className="text-xs text-muted-foreground">{flag.score}/100</span>
            </div>
          </div>
        </div>
        <span className="text-muted-foreground text-sm">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-current/10 space-y-3">
          {flag.evidence.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Evidence Found</p>
              <ul className="space-y-1">
                {flag.evidence.map((e, i) => <li key={i} className="text-xs text-foreground flex gap-1"><span>•</span>{e}</li>)}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">DSM-5 Reference</p>
            <p className="text-xs text-foreground leading-relaxed">{flag.dsmCriteria}</p>
          </div>
          {flag.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Recommendations</p>
              <ul className="space-y-1">
                {flag.recommendations.map((r, i) => <li key={i} className="text-xs text-foreground flex gap-1"><span>✓</span>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const WellnessTools = () => {
  const { t } = useLanguage();

  // Assessment
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; severity: string; color: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Feeling check-in
  const [feelingText, setFeelingText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [feelingSubmitted, setFeelingSubmitted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Breathing
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [countdown, setCountdown] = useState(4);

  // Diagnostic report
  const [generatingReport, setGeneratingReport] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [activeTab, setActiveTab] = useState("checkin");

  // Cross-data state
  const [latestDiagnosticData, setLatestDiagnosticData] = useState<DataSources | null>(null);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<{ score: number; severity: string; deficiencies: string[] }>({ score: 0, severity: 'Unknown', deficiencies: [] });
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use central diagnostic data service
    const data = await fetchAllDiagnosticData(user.id);
    setMoodLogs(data.moodLogs);
    setNutritionData({ score: data.nutritionScore, severity: data.nutritionSeverity, deficiencies: data.nutritionDeficiencies });
    setCompletedActivities(data.completedActivities);
    // Store the full data for report generation
    setLatestDiagnosticData(data);

    // Load assessment history separately for display
    const { data: assessments } = await supabase
      .from("stress_assessments")
      .select("*")
      .eq("id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (assessments) setHistory(assessments);
  };

  // ── BREATHING TIMER ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!breathingActive) return;
    const phases = [{ phase: "inhale" as const, duration: 4 }, { phase: "hold" as const, duration: 7 }, { phase: "exhale" as const, duration: 8 }];
    let idx = 0, remaining = 4;
    setBreathingPhase("inhale"); setCountdown(4);
    const interval = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        idx = (idx + 1) % phases.length;
        remaining = phases[idx].duration;
        setBreathingPhase(phases[idx].phase);
        setCountdown(phases[idx].duration);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [breathingActive]);

  // ── VOICE RECORDING ────────────────────────────────────────────────────────
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Voice recognition not supported in this browser. Please type instead."); return; }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(' ');
        setVoiceText(transcript);
      };
      recognition.onerror = () => { setIsRecording(false); toast.error("Voice recognition error. Please try again."); };
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      toast.info("🎤 Listening... speak freely about how you're feeling");
    }
  };

  // ── SUBMIT FEELING CHECK-IN ────────────────────────────────────────────────
  const submitFeeling = async () => {
    const combined = `${feelingText} ${voiceText}`.trim();
    if (!combined) { toast.error("Please type or speak about how you're feeling"); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("chat_messages" as any).insert({
          user_id: user.id,
          role: 'user',
          content: combined,
          session_id: null,
        });
      }
      setFeelingSubmitted(true);
      toast.success("Thank you for sharing! Your feelings have been recorded.");
    } catch (err) {
      setFeelingSubmitted(true); // still allow progress even if save fails
    }
  };

  // ── ASSESSMENT SUBMIT ──────────────────────────────────────────────────────
  const handleAssessmentSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const score = Object.values(answers).reduce((sum, ans) => sum + (scoreMap[ans] ?? 0), 0);
      const { label, color } = getSeverity(score);
      await (supabase as any).from("stress_assessments").insert({ user_id: user.id, answers: answers as any, score, severity: label });
      setAssessmentResult({ score, severity: label, color });
      toast.success("Assessment submitted!");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally { setSubmitting(false); }
  };

  // ── GENERATE DIAGNOSTIC REPORT ─────────────────────────────────────────────
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not logged in");
      const userId = authUser.id;

      // Fetch fresh data from ALL sources
      const freshData = await fetchAllDiagnosticData(userId);
      const combined = `${feelingText} ${voiceText}`.trim();

      // Merge in-session feeling text with saved chat data
      const dataSources: DataSources = {
        ...freshData,
        chatText: freshData.chatText + ' ' + combined,
        voiceText: freshData.voiceText + ' ' + voiceText,
        // Override with latest assessment if just taken this session
        assessmentScore: freshData.assessmentScore || assessmentResult?.score || 0,
        assessmentSeverity: freshData.assessmentSeverity !== 'None' ? freshData.assessmentSeverity : assessmentResult?.severity || 'None',
      };

      // Small delay for UX
      await new Promise(r => setTimeout(r, 1500));
      const report = generateDSMReport(dataSources);
      setDiagnosticReport(report);

      // Save to DB (reuse userId from above)
      if (userId) {
        await supabase.from("wellness_reports" as any).insert({
          user_id: userId,
          report_data: report as any,
          score: report.overallWellnessScore,
        });
      }

      setActiveTab("report");
      toast.success("Diagnostic report generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    } finally { setGeneratingReport(false); }
  };

  // ── PRINT REPORT ───────────────────────────────────────────────────────────
  const printReport = () => { window.print(); };

  // ── DATA READINESS CHECK ───────────────────────────────────────────────────
  const readiness = {
    checkin: feelingSubmitted || (feelingText.length > 10 || voiceText.length > 10),
    assessment: !!assessmentResult || history.length > 0,
    mood: moodLogs.length > 0,
    nutrition: nutritionData.score > 0,
  };
  const readinessCount = Object.values(readiness).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("wellnessToolsTitle")}</h1>
        <p className="text-muted-foreground">{t("wellnessToolsDesc")}</p>
      </div>

      {/* Progress banner */}
      <Card className="bg-gradient-to-r from-garden-blue/10 to-garden-purple/10 border-garden-blue/30">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <p className="font-semibold text-foreground">Diagnostic Report Progress</p>
              <p className="text-sm text-muted-foreground">Complete all 4 sections to generate your DSM-based report</p>
            </div>
            <Button onClick={handleGenerateReport} disabled={generatingReport || readinessCount < 2}
              className="bg-gradient-to-r from-garden-blue to-garden-purple text-white gap-2">
              <FileText className="w-4 h-4" />
              {generatingReport ? "Generating..." : readinessCount < 2 ? `Complete ${4 - readinessCount} more sections` : "Generate Diagnostic Report"}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Feeling Check-in", done: readiness.checkin, icon: <Heart className="w-4 h-4" /> },
              { label: "Assessment", done: readiness.assessment, icon: <Brain className="w-4 h-4" /> },
              { label: "Mood Logs", done: readiness.mood, icon: <Activity className="w-4 h-4" /> },
              { label: "Nutrition", done: readiness.nutrition, icon: <Utensils className="w-4 h-4" /> },
            ].map(({ label, done, icon }) => (
              <div key={label} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${done ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {done ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : icon}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="checkin" className="gap-1">💬 Feeling Check-in</TabsTrigger>
          <TabsTrigger value="assessment">📋 {t("stressAssessment")}</TabsTrigger>
          <TabsTrigger value="breathing">🌬️ {t("breathingExercise")}</TabsTrigger>
          {history.length > 0 && <TabsTrigger value="history">📊 {t("myHistory")}</TabsTrigger>}
          {diagnosticReport && <TabsTrigger value="report" className="gap-1 text-garden-blue font-semibold">🔬 Diagnostic Report</TabsTrigger>}
        </TabsList>

        {/* ── FEELING CHECK-IN TAB ──────────────────────────────────────────── */}
        <TabsContent value="checkin" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-garden-pink" />
                How are you feeling these days?
              </CardTitle>
              <CardDescription>
                Tell us in your own words — type, speak, or both. This helps us understand your emotional state and generate a more accurate wellness report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feelingSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="text-5xl">💚</div>
                  <p className="font-semibold text-foreground text-lg">Thank you for sharing!</p>
                  <p className="text-muted-foreground">Your feelings have been recorded and will be used in your diagnostic report.</p>
                  <Button variant="outline" onClick={() => setFeelingSubmitted(false)}>Edit My Response</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="font-medium">Type your feelings (text)</Label>
                    <Textarea
                      value={feelingText}
                      onChange={e => setFeelingText(e.target.value)}
                      placeholder="e.g. I've been feeling really stressed about my exams lately. I can't sleep well and I feel like I'm constantly worrying about everything..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium">Or speak your feelings (voice)</Label>
                    <div className="flex items-start gap-3">
                      <Button
                        type="button"
                        variant={isRecording ? "destructive" : "outline"}
                        className="gap-2 flex-shrink-0"
                        onClick={toggleVoice}
                      >
                        {isRecording ? <><MicOff className="w-4 h-4" />Stop Recording</> : <><Mic className="w-4 h-4" />Start Recording</>}
                      </Button>
                      {voiceText && (
                        <div className="flex-1 p-3 bg-muted rounded-lg text-sm text-foreground">
                          <p className="text-xs text-muted-foreground mb-1">Transcribed:</p>
                          {voiceText}
                        </div>
                      )}
                    </div>
                    {isRecording && (
                      <div className="flex items-center gap-2 text-sm text-red-500 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Recording... speak naturally about how you're feeling
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-3">Quick prompts to help you get started:</p>
                    <div className="flex flex-wrap gap-2">
                      {["I'm feeling stressed about...", "I've been having trouble sleeping", "I feel anxious when...", "I'm struggling with...", "I feel lonely because...", "I'm overwhelmed by..."]
                        .map(p => (
                          <button key={p} onClick={() => setFeelingText(prev => prev ? prev + ' ' + p : p)}
                            className="text-xs px-3 py-1.5 bg-muted hover:bg-garden-blue/10 hover:text-garden-blue rounded-full border border-border transition-colors">
                            {p}
                          </button>
                        ))}
                    </div>
                  </div>

                  <Button className="w-full gap-2" onClick={submitFeeling} disabled={!feelingText.trim() && !voiceText.trim()}>
                    <Send className="w-4 h-4" />Save My Feelings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ASSESSMENT TAB ────────────────────────────────────────────────── */}
        <TabsContent value="assessment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("stressAssessmentTitle")}</CardTitle>
              <CardDescription>{t("stressAssessmentDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assessmentResult ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl">
                    {assessmentResult.severity === "Minimal" ? "😊" : assessmentResult.severity === "Mild" ? "😐" : assessmentResult.severity === "Moderate" ? "😟" : "😰"}
                  </div>
                  <h2 className="text-2xl font-bold">{t("score")}: {assessmentResult.score} / 21</h2>
                  <Badge className={`${assessmentResult.color} text-base px-4 py-1`}>{assessmentResult.severity} Anxiety</Badge>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {assessmentResult.severity === "Minimal" && "Great! Your stress levels are well-managed."}
                    {assessmentResult.severity === "Mild" && "You're experiencing some stress. Consider relaxation techniques."}
                    {assessmentResult.severity === "Moderate" && "Moderate anxiety detected. We recommend booking a counselling session."}
                    {assessmentResult.severity === "Severe" && "Please consider reaching out to a counsellor or mental health professional."}
                  </p>
                  <Button onClick={() => { setAssessmentResult(null); setAnswers({}); }}>{t("takeAgain")}</Button>
                </div>
              ) : (
                <>
                  {stressQuestions.map((q) => (
                    <div key={q.id} className="space-y-3 pb-6 border-b border-border last:border-0">
                      <p className="font-medium text-foreground">{q.id}. {q.question}</p>
                      <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers(p => ({ ...p, [q.id]: v }))}>
                        {q.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${q.id}-${idx}`} />
                            <Label htmlFor={`q${q.id}-${idx}`} className="cursor-pointer">{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <Button className="w-full" disabled={Object.keys(answers).length < stressQuestions.length || submitting} onClick={handleAssessmentSubmit}>
                    {submitting ? t("submitting") : t("submitAssessment")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BREATHING TAB ─────────────────────────────────────────────────── */}
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
                  <Button onClick={() => { setBreathingActive(false); setBreathingPhase("inhale"); setCountdown(4); }} variant="outline" className="flex-1">{t("reset")}</Button>
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
                  <p className="text-lg text-muted-foreground capitalize">{breathingActive ? breathingPhase : t("clickStart")}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── HISTORY TAB ───────────────────────────────────────────────────── */}
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

        {/* ── DIAGNOSTIC REPORT TAB ─────────────────────────────────────────── */}
        {diagnosticReport && (
          <TabsContent value="report" className="mt-6 space-y-6">
            {/* Header card */}
            <Card className="bg-gradient-to-br from-garden-blue to-garden-purple text-white">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ScoreRing score={diagnosticReport.overallWellnessScore} size={140} />
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-white/70 text-sm uppercase tracking-wide mb-1">Wellness Diagnostic Report</p>
                    <h2 className="text-3xl font-black mb-1">{diagnosticReport.overallCategory}</h2>
                    <p className="text-white/90 leading-relaxed">{diagnosticReport.summary}</p>
                    <p className="text-white/60 text-xs mt-2">Generated {new Date(diagnosticReport.generatedAt).toLocaleString()}</p>
                  </div>
                  <Button onClick={printReport} variant="outline" className="border-white/40 text-white hover:bg-white/10 gap-2">
                    <Download className="w-4 h-4" />Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data completeness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-garden-blue" />
                  Data Sources Used ({diagnosticReport.dataCompleteness.completenessScore}% complete)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Feeling Check-in", done: diagnosticReport.dataCompleteness.chat },
                    { label: "Stress Assessment", done: diagnosticReport.dataCompleteness.assessment },
                    { label: "Mood Garden", done: diagnosticReport.dataCompleteness.mood },
                    { label: "Nutrition", done: diagnosticReport.dataCompleteness.nutrition },
                  ].map(({ label, done }) => (
                    <div key={label} className={`flex items-center gap-2 p-3 rounded-lg text-sm ${done ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-muted text-muted-foreground'}`}>
                      {done ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-current shrink-0" />}
                      {label}
                    </div>
                  ))}
                </div>
                {diagnosticReport.dataCompleteness.completenessScore < 100 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 Complete missing sections and regenerate for a more accurate report.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Clinical narrative */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4 text-garden-purple" />
                  Clinical Narrative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">{diagnosticReport.clinicalNarrative}</p>
              </CardContent>
            </Card>

            {/* Immediate actions */}
            {diagnosticReport.immediateActions.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-base text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Immediate Actions Recommended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnosticReport.immediateActions.map((a, i) => (
                      <li key={i} className="text-sm text-orange-900 flex gap-2"><span>→</span>{a}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* DSM Flags */}
            <div>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-garden-blue" />
                DSM-5 Domain Analysis ({diagnosticReport.flags.filter(f => f.flagged).length} areas flagged)
              </h3>
              <div className="space-y-3">
                {diagnosticReport.flags.map(flag => <FlagCard key={flag.code} flag={flag} />)}
              </div>
            </div>

            {/* Long-term recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-garden-green" />
                  Long-Term Wellness Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diagnosticReport.longTermRecommendations.map((r, i) => (
                    <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-garden-blue font-bold">{i + 1}.</span>{r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="bg-muted border-muted-foreground/20">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  ⚕️ <strong>Medical Disclaimer:</strong> {diagnosticReport.disclaimer}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default WellnessTools;
