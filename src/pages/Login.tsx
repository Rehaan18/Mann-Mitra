import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flower2, User, Briefcase, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type UserRole = "student"|"counsellor"|"administrator";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const roleDescriptions: Record<UserRole,string> = {
    student: t("studentDesc"),
    counsellor: t("counsellorDesc"),
    administrator: t("adminDesc"),
  };

  const resetForm = () => {
    setEmail(""); setPassword(""); setConfirmPassword(""); setFullName("");
    setStudentId(""); setDepartment(""); setYear(""); setLicenseNumber("");
    setSpecialization(""); setAdminCode(""); setError(""); setSuccess("");
  };

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (!email || !password) throw new Error("Email and password are required");
      if (!isLogin && password !== confirmPassword) throw new Error("Passwords do not match");
      if (!isLogin && password.length < 6) throw new Error("Password must be at least 6 characters");

      if (isLogin) {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();
        if (profileError) throw new Error("Failed to fetch user profile.");
        if (!profile) { await supabase.auth.signOut(); throw new Error("User profile not found."); }
        if (profile.role !== selectedRole) { await supabase.auth.signOut(); throw new Error(`Invalid credentials for ${selectedRole} role. Please select the correct role (${profile.role}).`); }
        toast.success(t("loginSuccess"));
        setTimeout(() => navigate("/"), 500);
      } else {
        if (selectedRole === "administrator" && adminCode !== "ADMIN2024") throw new Error("Invalid administrator code");
        if (selectedRole === "student" && (!studentId || !department || !year)) throw new Error("Please fill in all student information");
        if (selectedRole === "counsellor" && (!licenseNumber || !specialization)) throw new Error("Please fill in all counsellor information");
        if (!fullName) throw new Error("Please enter your full name");

        const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("User creation failed");

        const profileData: any = { id: authData.user.id, full_name: fullName, role: selectedRole, email };
        if (selectedRole === "student") { profileData.student_id = studentId; profileData.department = department; profileData.year = year; }
        else if (selectedRole === "counsellor") { profileData.license_number = licenseNumber; profileData.specialization = specialization; }

        const { error: profileError } = await supabase.from("profiles").insert([profileData]).select().single();
        if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);

        setSuccess(t("accountCreated"));
        toast.success(t("accountCreated"));
        setTimeout(() => { setIsLogin(true); resetForm(); }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      toast.error(err.message || "An error occurred");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-garden-blue/10 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-garden-blue to-garden-purple rounded-lg flex items-center justify-center">
              <Flower2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">{t("appName")}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t("tagline")}</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{isLogin ? t("welcomeBack") : t("signUp")}</CardTitle>
            <CardDescription className="text-center">{isLogin ? t("signInToContinue") : t("joinUs")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                {isLogin ? t("selectRoleToLogin") : t("selectRoleToSignUp")}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["student","counsellor","administrator"] as UserRole[]).map((role) => (
                  <button key={role} type="button"
                    onClick={() => { setSelectedRole(role); isLogin ? setError("") : resetForm(); }}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedRole === role ? "border-garden-blue bg-garden-blue/10" : "border-border bg-card"}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={selectedRole === role ? "text-garden-blue" : "text-muted-foreground"}>
                        {role === "student" ? <User className="w-8 h-8" /> : role === "counsellor" ? <Briefcase className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                      </div>
                      <span className="font-semibold text-foreground capitalize">{role}</span>
                      <span className="text-xs text-muted-foreground text-center">{roleDescriptions[role]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && <Alert className="mb-4 border-destructive bg-destructive/10"><AlertDescription className="text-destructive">{error}</AlertDescription></Alert>}
            {success && <Alert className="mb-4 border-success bg-success/10"><AlertDescription className="text-success">{success}</AlertDescription></Alert>}

            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("fullName")}</label>
                  <Input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t("fullName")} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("email")}</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("email")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("password")}</label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={t("password")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("confirmPassword")}</label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t("confirmPassword")} />
                </div>
              )}

              {/* Student Fields */}
              {!isLogin && selectedRole === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("studentId")} *</label>
                    <Input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder={t("enterStudentId")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t("department")} *</label>
                      <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground h-10">
                        <option value="">{t("selectDepartment")}</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business">Business</option>
                        <option value="Arts & Humanities">Arts & Humanities</option>
                        <option value="Science">Science</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">{t("year")} *</label>
                      <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground h-10">
                        <option value="">{t("selectYear")}</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Counsellor Fields */}
              {!isLogin && selectedRole === "counsellor" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("licenseNumber")} *</label>
                    <Input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder={t("enterLicenseNumber")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t("specialization")} *</label>
                    <select value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground h-10">
                      <option value="">{t("selectSpecialization")}</option>
                      <option value="Anxiety & Depression">Anxiety & Depression</option>
                      <option value="Stress Management">Stress Management</option>
                      <option value="Academic Stress">Academic Stress</option>
                      <option value="Relationship Counseling">Relationship Counseling</option>
                      <option value="General Counseling">General Counseling</option>
                    </select>
                  </div>
                </>
              )}

              {/* Admin Fields */}
              {!isLogin && selectedRole === "administrator" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("adminCode")} *</label>
                  <Input type="text" value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder={t("enterAdminCode")} />
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? t("processing") : isLogin ? t("login") : t("signUp")}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button type="button" onClick={() => { setIsLogin(!isLogin); resetForm(); }} className="text-sm text-garden-blue hover:underline">
                {isLogin ? t("dontHaveAccount") : t("alreadyHaveAccount")}
              </button>
            </div>
            {isLogin && (
              <div className="mt-4 text-center">
                <button type="button" className="text-sm text-muted-foreground hover:text-foreground">{t("forgotPassword")}</button>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-8 text-center text-sm text-muted-foreground"><p>{t("termsText")}</p></div>
      </div>
    </div>
  );
};

export default Login;
