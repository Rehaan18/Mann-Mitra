import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MapPin, Award, Shield, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '', email: '', role: '', studentId: '',
    department: '', year: '', phone: '', location: '',
    bio: '', licenseNumber: '', specialization: '',
  });
  const [editProfile, setEditProfile] = useState({ ...profile });
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) {
          const p = {
            fullName: profileData.full_name || '',
            email: profileData.email || user.email || '',
            role: profileData.role || '',
            studentId: profileData.student_id || '',
            department: profileData.department || '',
            year: profileData.year || '',
            phone: (profileData as any).phone || '',
            location: (profileData as any).location || '',
            bio: (profileData as any).bio || '',
            licenseNumber: profileData.license_number || '',
            specialization: profileData.specialization || '',
          };
          setProfile(p);
          setEditProfile(p);
        }

        // Load stats
        const { count: ac } = await (supabase as any).from('stress_assessments').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        setAssessmentCount(ac || 0);
        const { count: sc } = await (supabase as any).from('session_bookings').select('*', { count: 'exact', head: true }).eq('student_id', user.id);
        setSessionCount(sc || 0);
      }
    } catch (error) { console.error('Error loading profile:', error); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('profiles').update({
        full_name: editProfile.fullName,
        phone: editProfile.phone,
        location: editProfile.location,
        bio: editProfile.bio,
        updated_at: new Date().toISOString(),
      } as any).eq('id', user.id);
      if (error) throw error;
      setProfile({ ...editProfile });
      setEditing(false);
      toast.success(t('profileUpdated'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading profile...</p></div>;

  const roleColor: Record<string, string> = { student: 'bg-blue-100 text-blue-800', counsellor: 'bg-purple-100 text-purple-800', administrator: 'bg-red-100 text-red-800' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("profileTitle")}</h1>
          <p className="text-muted-foreground">{t("profileDesc")}</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2"><Edit2 className="w-4 h-4" />{t("editProfile")}</Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => { setEditing(false); setEditProfile({ ...profile }); }} variant="outline" className="gap-2"><X className="w-4 h-4" />{t("cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? t("loading") : t("saveChanges")}</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar & role card */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-garden-blue to-garden-purple flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{profile.fullName || 'Unknown User'}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            <Badge className={roleColor[profile.role] || 'bg-gray-100 text-gray-800'}>{profile.role || 'Unknown Role'}</Badge>

            <div className="w-full grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{assessmentCount}</p>
                <p className="text-xs text-muted-foreground">{t("assessments")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{sessionCount}</p>
                <p className="text-xs text-muted-foreground">{t("sessions")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList><TabsTrigger value="personal">{t("personalInfo")}</TabsTrigger><TabsTrigger value="academic">{t("academicProfessional")}</TabsTrigger></TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader><CardTitle>{t("personalInformation")}</CardTitle><CardDescription>{t("basicProfileDetails")}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {editing
                        ? <Input value={editProfile.fullName} onChange={(e) => setEditProfile(p => ({ ...p, fullName: e.target.value }))} />
                        : <div className="flex items-center gap-2 text-foreground"><User className="w-4 h-4 text-muted-foreground" />{profile.fullName || '—'}</div>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex items-center gap-2 text-foreground"><Mail className="w-4 h-4 text-muted-foreground" />{profile.email}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      {editing
                        ? <Input value={editProfile.phone} onChange={(e) => setEditProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                        : <div className="flex items-center gap-2 text-foreground"><Phone className="w-4 h-4 text-muted-foreground" />{profile.phone || '—'}</div>}
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      {editing
                        ? <Input value={editProfile.location} onChange={(e) => setEditProfile(p => ({ ...p, location: e.target.value }))} placeholder="City, State" />
                        : <div className="flex items-center gap-2 text-foreground"><MapPin className="w-4 h-4 text-muted-foreground" />{profile.location || '—'}</div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    {editing
                      ? <textarea value={editProfile.bio} onChange={(e) => setEditProfile(p => ({ ...p, bio: e.target.value }))} className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground resize-none" rows={3} placeholder="Tell us a little about yourself..." />
                      : <p className="text-foreground">{profile.bio || '—'}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="mt-4">
              <Card>
                <CardHeader><CardTitle>{profile.role === 'student' ? 'Academic Information' : 'Professional Information'}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {profile.role === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-muted-foreground text-xs">STUDENT ID</Label><p className="font-medium text-foreground">{profile.studentId || '—'}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground text-xs">DEPARTMENT</Label><p className="font-medium text-foreground">{profile.department || '—'}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground text-xs">YEAR</Label><p className="font-medium text-foreground">{profile.year || '—'}</p></div>
                    </div>
                  )}
                  {profile.role === 'counsellor' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-muted-foreground text-xs">LICENSE NUMBER</Label><p className="font-medium text-foreground">{profile.licenseNumber || '—'}</p></div>
                      <div className="space-y-1"><Label className="text-muted-foreground text-xs">SPECIALIZATION</Label><p className="font-medium text-foreground">{profile.specialization || '—'}</p></div>
                    </div>
                  )}
                  {profile.role === 'administrator' && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                      <Shield className="w-6 h-6 text-red-500" />
                      <div><p className="font-medium text-foreground">Administrator Account</p><p className="text-sm text-muted-foreground">Full system access</p></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted mt-2">
                    <Award className="w-6 h-6 text-garden-blue" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("fieldsNote")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
