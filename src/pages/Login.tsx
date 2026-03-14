import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Flower2,
  User,
  Briefcase,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

type UserRole = "student" | "counsellor" | "administrator";

const Login = () => {
  const navigate = useNavigate();
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

  // Role-specific fields
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const roleIcons = {
    student: <User className="w-8 h-8" />,
    counsellor: <Briefcase className="w-8 h-8" />,
    administrator: <Shield className="w-8 h-8" />,
  };

  const roleDescriptions = {
    student:
      "Access mental health resources, book counseling sessions, and track your wellness journey",
    counsellor:
      "Manage appointments, provide support to students, and access professional resources",
    administrator:
      "Manage platform settings, view analytics, and oversee system operations",
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (!isLogin && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!isLogin && password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (isLogin) {
        // LOGIN FLOW
        console.log("=== LOGIN FLOW ===");
        console.log("Attempting login with role:", selectedRole);
        
        const { data: authData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.error("Sign in error:", signInError);
          throw signInError;
        }

        console.log("Login successful, user ID:", authData.user.id);

        // Verify user role matches selected role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        console.log("Profile check - data:", profile);
        console.log("Profile check - error:", profileError);

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw new Error("Failed to fetch user profile. Please contact support.");
        }

        if (!profile) {
          await supabase.auth.signOut();
          throw new Error("User profile not found. Please contact support.");
        }

        if (profile.role !== selectedRole) {
          console.log(`Role mismatch: expected ${selectedRole}, got ${profile.role}`);
          await supabase.auth.signOut();
          throw new Error(
            `Invalid credentials for ${selectedRole} role. Please select the correct role (${profile.role}).`
          );
        }

        console.log("Role verification successful:", profile.role);
        toast.success("Login successful!");

        // Navigate based on role
        setTimeout(() => {
          navigate("/");
        }, 500);
        
      } else {
        // SIGNUP FLOW
        console.log("=== SIGNUP FLOW ===");
        console.log("Creating account with role:", selectedRole);

        // Validate role-specific fields
        if (selectedRole === "administrator" && adminCode !== "ADMIN2024") {
          throw new Error("Invalid administrator code");
        }

        if (selectedRole === "student") {
          if (!studentId || !department || !year) {
            throw new Error("Please fill in all student information");
          }
        } else if (selectedRole === "counsellor") {
          if (!licenseNumber || !specialization) {
            throw new Error("Please fill in all counsellor information");
          }
        }

        if (!fullName) {
          throw new Error("Please enter your full name");
        }

        // Create auth user
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

        if (signUpError) {
          console.error("Sign up error:", signUpError);
          throw signUpError;
        }
        
        if (!authData.user) {
          throw new Error("User creation failed");
        }

        console.log("User created successfully, ID:", authData.user.id);

        // Create profile with role-specific data
        const profileData: Database['public']['Tables']['profiles']['Insert'] = {
          id: authData.user.id,
          full_name: fullName,
          role: selectedRole, // CRITICAL: Set the role
          email: email,
        };

        // Add role-specific fields
        if (selectedRole === "student") {
          profileData.student_id = studentId;
          profileData.department = department;
          profileData.year = year;
          console.log("Adding student data:", { studentId, department, year });
        } else if (selectedRole === "counsellor") {
          profileData.license_number = licenseNumber;
          profileData.specialization = specialization;
          console.log("Adding counsellor data:", { licenseNumber, specialization });
        }

        console.log("Creating profile with data:", profileData);

        const { data: insertedProfile, error: profileError } = await supabase
          .from("profiles")
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Try to clean up the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        console.log("Profile created successfully:", insertedProfile);

        setSuccess(
          "Account created successfully! Please check your email to verify your account, then you can log in."
        );
        toast.success("Account created! Please verify your email.");

        // Reset form and switch to login
        setTimeout(() => {
          setIsLogin(true);
          resetForm();
        }, 2000);
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setStudentId("");
    setDepartment("");
    setYear("");
    setLicenseNumber("");
    setSpecialization("");
    setAdminCode("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-garden-blue/10 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-garden-blue to-garden-purple rounded-lg flex items-center justify-center">
              <Flower2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Mann Mitra</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your Mental Health Companion
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Sign in to continue your wellness journey"
                : "Join us to start your wellness journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                {isLogin
                  ? "Select Your Role to Login"
                  : "Select Your Role to Sign Up"}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(
                  ["student", "counsellor", "administrator"] as UserRole[]
                ).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      if (isLogin) {
                        setError("");
                      } else {
                        resetForm();
                      }
                    }}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedRole === role
                        ? "border-garden-blue bg-garden-blue/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={
                          selectedRole === role
                            ? "text-garden-blue"
                            : "text-muted-foreground"
                        }
                      >
                        {roleIcons[role]}
                      </div>
                      <span className="font-semibold text-foreground capitalize">
                        {role}
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        {roleDescriptions[role]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-destructive bg-destructive/10">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-success bg-success/10">
                <AlertDescription className="text-success">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {/* Student Fields */}
              {!isLogin && selectedRole === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Student ID *
                    </label>
                    <Input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter your student ID"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Department *
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground h-10"
                        required
                      >
                        <option value="">Select department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business">Business</option>
                        <option value="Arts & Humanities">
                          Arts & Humanities
                        </option>
                        <option value="Science">Science</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Year *
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground h-10"
                        required
                      >
                        <option value="">Select year</option>
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      License Number *
                    </label>
                    <Input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Enter your professional license number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Specialization *
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground h-10"
                      required
                    >
                      <option value="">Select specialization</option>
                      <option value="Anxiety & Depression">
                        Anxiety & Depression
                      </option>
                      <option value="Stress Management">
                        Stress Management
                      </option>
                      <option value="Academic Stress">Academic Stress</option>
                      <option value="Relationship Counseling">
                        Relationship Counseling
                      </option>
                      <option value="General Counseling">
                        General Counseling
                      </option>
                    </select>
                  </div>
                </>
              )}

              {/* Administrator Fields */}
              {!isLogin && selectedRole === "administrator" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Administrator Code *
                  </label>
                  <Input
                    type="text"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter administrator verification code"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact system administrator for the verification code
                    (Default: ADMIN2024)
                  </p>
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </div>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                className="text-sm text-garden-blue hover:underline"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to Mann Mitra's Terms of Service and Privacy
            Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;