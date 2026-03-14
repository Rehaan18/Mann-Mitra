import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { User, Mail, Phone, MapPin, Calendar, Award, Shield, Edit2, Save } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    role: '',
    studentId: '',
    department: '',
    year: '',
    phone: '',
    location: '',
    bio: '',
    licenseNumber: '',
    specialization: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile({
            fullName: profileData.full_name || '',
            email: profileData.email || user.email || '',
            role: profileData.role || '',
            studentId: profileData.student_id || '',
            department: profileData.department || '',
            year: profileData.year || '',
            phone: '',
            location: '',
            bio: '',
            licenseNumber: profileData.license_number || '',
            specialization: profileData.specialization || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updates: Database['public']['Tables']['profiles']['Update'] = {
          id: user.id,
          full_name: profile.fullName,
          updated_at: new Date().toISOString(),
        };

        if (profile.role === 'student') {
          updates.student_id = profile.studentId;
          updates.department = profile.department;
          updates.year = profile.year;
        } else if (profile.role === 'counsellor') {
          updates.license_number = profile.licenseNumber;
          updates.specialization = profile.specialization;
        }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;

        toast.success('Profile updated successfully!');
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-garden-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getRoleBadge = () => {
    const colors = {
      student: 'bg-garden-blue',
      counsellor: 'bg-garden-purple',
      administrator: 'bg-garden-green'
    };
    return colors[profile.role as keyof typeof colors] || 'bg-muted';
  };

  const getRoleIcon = () => {
    if (profile.role === 'student') return <User className="w-4 h-4" />;
    if (profile.role === 'counsellor') return <Award className="w-4 h-4" />;
    if (profile.role === 'administrator') return <Shield className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      {/* Profile Header Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-garden-blue via-garden-purple to-garden-pink"></div>
        <CardContent className="pt-20 pb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-garden-blue to-garden-purple flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <Badge className={`absolute bottom-2 right-2 ${getRoleBadge()} text-white border-4 border-white`}>
                {getRoleIcon()}
                <span className="ml-1 capitalize">{profile.role}</span>
              </Badge>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">{profile.fullName}</h2>
              <p className="text-muted-foreground mb-3">{profile.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {profile.role === 'student' && profile.department && (
                  <Badge variant="outline">{profile.department}</Badge>
                )}
                {profile.role === 'student' && profile.year && (
                  <Badge variant="outline">{profile.year}</Badge>
                )}
                {profile.role === 'counsellor' && profile.specialization && (
                  <Badge variant="outline">{profile.specialization}</Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="self-start"
            >
              {editing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="personal" className="flex-1">Personal Info</TabsTrigger>
          <TabsTrigger value="academic" className="flex-1">
            {profile.role === 'student' ? 'Academic Info' : 'Professional Info'}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">Activity Stats</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!editing}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      disabled={!editing}
                      placeholder="Delhi, India"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!editing}
                  className="w-full min-h-[100px] p-3 rounded-md bg-background border border-input text-foreground resize-none disabled:opacity-50"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic/Professional Information Tab */}
        <TabsContent value="academic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {profile.role === 'student' ? 'Academic Information' : 'Professional Information'}
              </CardTitle>
              <CardDescription>
                {profile.role === 'student' 
                  ? 'Your educational details' 
                  : 'Your professional credentials'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.role === 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={profile.studentId}
                      onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      disabled={!editing}
                      className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground disabled:opacity-50 h-10"
                    >
                      <option value="">Select department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business">Business</option>
                      <option value="Arts & Humanities">Arts & Humanities</option>
                      <option value="Science">Science</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <select
                      id="year"
                      value={profile.year}
                      onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                      disabled={!editing}
                      className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground disabled:opacity-50 h-10"
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="enrollmentDate"
                        type="date"
                        disabled={!editing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {profile.role === 'counsellor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={profile.licenseNumber}
                      onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                      disabled={!editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <select
                      id="specialization"
                      value={profile.specialization}
                      onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                      disabled={!editing}
                      className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground disabled:opacity-50 h-10"
                    >
                      <option value="">Select specialization</option>
                      <option value="Anxiety & Depression">Anxiety & Depression</option>
                      <option value="Stress Management">Stress Management</option>
                      <option value="Academic Stress">Academic Stress</option>
                      <option value="Relationship Counseling">Relationship Counseling</option>
                      <option value="General Counseling">General Counseling</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      disabled={!editing}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      disabled={!editing}
                      placeholder="Ph.D. Psychology"
                    />
                  </div>
                </div>
              )}

              {profile.role === 'administrator' && (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-garden-green" />
                  <p className="text-lg font-semibold">Administrator Account</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You have full access to platform management and analytics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Stats Tab */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Activities</span>
                  <span className="text-2xl font-bold">47</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Current Streak</span>
                  <span className="text-2xl font-bold">7 days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Points Earned</span>
                  <span className="text-2xl font-bold">1,245</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Garden Level</span>
                  <span className="text-2xl font-bold">3</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                  <Award className="w-8 h-8 text-success" />
                  <div>
                    <p className="font-semibold text-sm">Wellness Warrior</p>
                    <p className="text-xs text-muted-foreground">7-day streak achieved</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <Award className="w-8 h-8 text-warning" />
                  <div>
                    <p className="font-semibold text-sm">Early Bird</p>
                    <p className="text-xs text-muted-foreground">3 morning activities</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border opacity-50">
                  <Award className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm">Social Butterfly</p>
                    <p className="text-xs text-muted-foreground">4/10 social activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;