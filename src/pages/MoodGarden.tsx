import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Flower2, 
  Star, 
  TrendingUp, 
  Award, 
  Droplets,
  Heart,
  Target,
  CheckCircle2,
  Sparkles,
  Trophy,
  Clock,
  Smile
} from "lucide-react";

interface Plant {
  id: number;
  name: string;
  category: string;
  categoryColor: string;
  progress: number;
  level: number;
  emoji: string;
  unlocked: boolean;
  xpToNext: number;
  currentXp: number;
  streak: number;
}

interface Activity {
  id: number;
  name: string;
  category: string;
  plantId: number;
  duration: string;
  xp: number;
  completed: boolean;
  icon: string;
  description: string;
}

const MoodGarden = () => {
  const [plants, setPlants] = useState<Plant[]>(([
    {
      id: 1,
      name: "Serenity Lotus",
      category: "mindfulness",
      categoryColor: "hsl(280, 100%, 70%)",
      progress: 65,
      level: 3,
      emoji: "🌸",
      unlocked: true,
      xpToNext: 350,
      currentXp: 228,
      streak: 5,
    },
    {
      id: 2,
      name: "Energy Oak",
      category: "exercise",
      categoryColor: "hsl(142, 76%, 36%)",
      progress: 30,
      level: 2,
      emoji: "🌳",
      unlocked: true,
      xpToNext: 200,
      currentXp: 60,
      streak: 3,
    },
    {
      id: 3,
      name: "Connection Rose",
      category: "social",
      categoryColor: "hsl(330, 81%, 60%)",
      progress: 80,
      level: 4,
      emoji: "🌹",
      unlocked: true,
      xpToNext: 500,
      currentXp: 400,
      streak: 7,
    },
    {
      id: 4,
      name: "Healing Herb",
      category: "therapy",
      categoryColor: "hsl(217, 91%, 60%)",
      progress: 20,
      level: 1,
      emoji: "🌿",
      unlocked: true,
      xpToNext: 100,
      currentXp: 20,
      streak: 1,
    },
    {
      id: 5,
      name: "Rest Lavender",
      category: "sleep",
      categoryColor: "hsl(280, 100%, 70%)",
      progress: 90,
      level: 5,
      emoji: "🌾",
      unlocked: true,
      xpToNext: 600,
      currentXp: 540,
      streak: 10,
    },
    {
      id: 6,
      name: "Focus Bamboo",
      category: "study",
      categoryColor: "hsl(142, 76%, 36%)",
      progress: 15,
      level: 1,
      emoji: "🎋",
      unlocked: false,
      xpToNext: 100,
      currentXp: 15,
      streak: 0,
    },
  ]));

  const [activities, setActivities] = useState<Activity[]>(([
    {
      id: 1,
      name: "Morning Meditation",
      category: "mindfulness",
      plantId: 1,
      duration: "10 min",
      xp: 25,
      completed: false,
      icon: "🧘",
      description: "Start your day with a calming meditation session"
    },
    {
      id: 2,
      name: "Gratitude Journal",
      category: "mindfulness",
      plantId: 1,
      duration: "5 min",
      xp: 15,
      completed: false,
      icon: "📝",
      description: "Write down 3 things you're grateful for today"
    },
    {
      id: 3,
      name: "Quick Walk",
      category: "exercise",
      plantId: 2,
      duration: "15 min",
      xp: 30,
      completed: false,
      icon: "🚶",
      description: "Take a refreshing walk outdoors"
    },
    {
      id: 4,
      name: "Yoga Session",
      category: "exercise",
      plantId: 2,
      duration: "20 min",
      xp: 40,
      completed: false,
      icon: "🧘‍♀️",
      description: "Stretch and strengthen your body"
    },
    {
      id: 5,
      name: "Call a Friend",
      category: "social",
      plantId: 3,
      duration: "15 min",
      xp: 35,
      completed: false,
      icon: "📞",
      description: "Connect with someone you care about"
    },
    {
      id: 6,
      name: "Join Study Group",
      category: "social",
      plantId: 3,
      duration: "30 min",
      xp: 45,
      completed: false,
      icon: "👥",
      description: "Study with peers and build connections"
    },
    {
      id: 7,
      name: "Breathing Exercise",
      category: "therapy",
      plantId: 4,
      duration: "5 min",
      xp: 20,
      completed: false,
      icon: "🌬️",
      description: "Practice 4-7-8 breathing technique"
    },
    {
      id: 8,
      name: "Evening Wind Down",
      category: "sleep",
      plantId: 5,
      duration: "20 min",
      xp: 30,
      completed: false,
      icon: "🌙",
      description: "Prepare your mind and body for rest"
    },
  ]));

  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [moodNote, setMoodNote] = useState("");

  const moods = [
    { emoji: "😊", label: "Happy", value: "Happy" },
    { emoji: "😌", label: "Calm", value: "Calm" },
    { emoji: "💪", label: "Motivated", value: "Motivated" },
    { emoji: "😐", label: "Okay", value: "Okay" },
    { emoji: "😰", label: "Stressed", value: "Stressed" },
    { emoji: "😟", label: "Anxious", value: "Anxious" },
    { emoji: "😔", label: "Sad", value: "Sad" },
    { emoji: "😫", label: "Struggling", value: "Struggling" },
  ];

  const logMood = async () => {
    if (!selectedMood) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("department").eq("id", user.id).single();
      await (supabase as any).from("mood_logs").insert({
        user_id: user.id,
        mood: selectedMood,
        department: profile?.department || null,
      });
      setMoodSubmitted(true);
      toast.success(`Mood logged: ${selectedMood} 🌱`);
    } catch (err) {
      console.error("Failed to log mood:", err);
      toast.error("Failed to save mood");
    }
  };

  const totalPoints = plants.reduce((sum, plant) => sum + plant.currentXp, 0);
  const currentStreak = Math.max(...plants.map(p => p.streak));
  const gardenLevel = Math.floor(totalPoints / 500) + 1;

  const completeActivity = async (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity || activity.completed) return;

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from("garden_activities").insert({
          user_id: user.id,
          activity_name: activity.name,
          category: activity.category,
          xp_earned: activity.xp,
          plant_id: activity.plantId,
        });
      }
    } catch (err) {
      console.error("Failed to save activity:", err);
    }

    toast.success(`+${activity.xp} XP earned! 🌱`);

    // Update activity
    setActivities(prev => prev.map(a =>
      a.id === activityId ? { ...a, completed: true } : a
    ));

    // Update plant
    setPlants(prev => prev.map(plant => {
      if (plant.id === activity.plantId) {
        const newXp = plant.currentXp + activity.xp;
        const newLevel = newXp >= plant.xpToNext ? plant.level + 1 : plant.level;
        const remainingXp = newXp >= plant.xpToNext ? newXp - plant.xpToNext : newXp;
        const newProgress = (remainingXp / plant.xpToNext) * 100;

        return {
          ...plant,
          currentXp: remainingXp,
          level: newLevel,
          progress: Math.min(newProgress, 100),
          streak: plant.streak + 1,
          unlocked: true,
        };
      }
      return plant;
    }));

    setShowActivityModal(false);
  };

  const waterPlant = async (plantId: number) => {
    // Save watering event to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from("garden_activities").insert({
          user_id: user.id,
          activity_name: "Watered Plant",
          category: "self-care",
          xp_earned: 10,
          plant_id: plantId,
        });
      }
    } catch (err) {
      console.error("Failed to save watering:", err);
    }

    toast.success("+10 XP for watering! 💧");

    setPlants(prev => prev.map(plant => {
      if (plant.id === plantId && plant.unlocked) {
        return {
          ...plant,
          currentXp: plant.currentXp + 10,
          progress: Math.min(plant.progress + 5, 100),
        };
      }
      return plant;
    }));
  };

  const PlantCard = ({ plant }: { plant: Plant }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (plant.progress / 100) * circumference;

    return (
      <div 
        className={`relative cursor-pointer transition-transform hover:scale-105 ${
          !plant.unlocked ? 'opacity-50' : ''
        }`}
        onClick={() => plant.unlocked && setSelectedPlant(plant)}
      >
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke={plant.categoryColor}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">{plant.unlocked ? plant.emoji : '🔒'}</div>
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
            {plant.level}
          </div>
          {plant.streak > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-garden-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
              🔥{plant.streak}
            </div>
          )}
        </div>
        <div className="text-center mt-3">
          <h3 className="text-foreground font-semibold mb-1">{plant.name}</h3>
          <p className="text-xs mb-1" style={{ color: plant.categoryColor }}>
            {plant.category}
          </p>
          <div className="text-xs text-muted-foreground">
            {plant.unlocked ? `${plant.currentXp}/${plant.xpToNext} XP` : 'Locked'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-garden-green via-garden-purple to-garden-blue rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Flower2 className="w-10 h-10" />
          <div>
            <h1 className="text-4xl font-bold">Your Mood Garden</h1>
            <p className="text-white/90 text-lg">Nurture your mental wellness and watch your garden bloom</p>
          </div>
        </div>
      </div>

      {/* Daily Mood Check-in */}
      <Card className="border-garden-purple/30 bg-gradient-to-r from-garden-purple/5 to-garden-blue/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-garden-purple" />
            How are you feeling today?
          </CardTitle>
          <CardDescription>Log your daily mood — this data helps generate your Diagnostic Report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {moodSubmitted ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-4xl">{moods.find(m => m.value === selectedMood)?.emoji}</p>
              <p className="font-semibold text-foreground">Mood logged: {selectedMood} ✅</p>
              <p className="text-sm text-muted-foreground">Your mood has been saved to your wellness profile.</p>
              <button onClick={() => { setMoodSubmitted(false); setSelectedMood(null); }} className="text-xs text-garden-blue hover:underline">Log again</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {moods.map(m => (
                  <button key={m.value} onClick={() => setSelectedMood(m.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedMood === m.value ? "border-garden-purple bg-garden-purple/10" : "border-border bg-card"}`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs font-medium text-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full" disabled={!selectedMood} onClick={logMood}>
                Save Today's Mood
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success to-success/80 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Points</p>
                <p className="text-3xl font-bold">{totalPoints}</p>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning to-warning/80 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Streak</p>
                <p className="text-3xl font-bold">{currentStreak}</p>
                <p className="text-xs opacity-90">days</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info to-info/80 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Garden Level</p>
                <p className="text-3xl font-bold">{gardenLevel}</p>
              </div>
              <Award className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-garden-pink to-garden-pink/80 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Plants Unlocked</p>
                <p className="text-3xl font-bold">{plants.filter(p => p.unlocked).length}/{plants.length}</p>
              </div>
              <Flower2 className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Garden Display */}
      <Card className="border-2 border-dashed border-garden-green/50 bg-gradient-to-br from-garden-green/5 to-garden-purple/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-garden-purple" />
            Your Growing Garden
          </CardTitle>
          <CardDescription>Click on a plant to see details and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-4">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activities Section */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="daily" className="flex-1">Daily Activities</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed ({activities.filter(a => a.completed).length})</TabsTrigger>
          <TabsTrigger value="rewards" className="flex-1">Rewards & Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.filter(a => !a.completed).map((activity) => {
              const plant = plants.find(p => p.id === activity.plantId);
              return (
                <Card 
                  key={activity.id}
                  className="hover:border-garden-blue transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedActivity(activity);
                    setShowActivityModal(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{activity.icon}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{activity.name}</h3>
                          <p className="text-sm" style={{ color: plant?.categoryColor }}>
                            {activity.category}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-success/20 text-success border-success">
                        +{activity.xp} XP
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">⏱️ {activity.duration}</span>
                      <span className="text-muted-foreground">Waters: {plant?.emoji}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.filter(a => a.completed).map((activity) => {
              const plant = plants.find(p => p.id === activity.plantId);
              return (
                <Card key={activity.id} className="bg-success/5 border-success/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl opacity-50">{activity.icon}</span>
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {activity.name}
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          </h3>
                          <p className="text-sm text-muted-foreground">{activity.category}</p>
                        </div>
                      </div>
                      <Badge className="bg-success text-white">
                        Completed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {activities.filter(a => a.completed).length === 0 && (
              <Card className="col-span-2">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No completed activities yet. Start completing activities to see them here!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-warning" />
                <h3 className="font-bold text-lg mb-2">Early Bird</h3>
                <p className="text-sm text-muted-foreground">Complete 3 morning activities</p>
                <Progress value={60} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">2/3 completed</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="w-16 h-16 mx-auto mb-4 text-success" />
                <h3 className="font-bold text-lg mb-2">Wellness Warrior</h3>
                <p className="text-sm text-muted-foreground">Maintain a 7-day streak</p>
                <Progress value={100} className="mt-3" />
                <Badge className="mt-2 bg-success text-white">Unlocked!</Badge>
              </CardContent>
            </Card>

            <Card className="text-center opacity-50">
              <CardContent className="p-6">
                <Heart className="w-16 h-16 mx-auto mb-4 text-garden-pink" />
                <h3 className="font-bold text-lg mb-2">Social Butterfly</h3>
                <p className="text-sm text-muted-foreground">Complete 10 social activities</p>
                <Progress value={40} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-2">4/10 completed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Activity Modal */}
      {showActivityModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-4xl">{selectedActivity.icon}</span>
                {selectedActivity.name}
              </CardTitle>
              <CardDescription>{selectedActivity.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{selectedActivity.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">XP Reward</p>
                  <p className="font-semibold text-success">+{selectedActivity.xp}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => completeActivity(selectedActivity.id)}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Activity
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plant Details Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-5xl">{selectedPlant.emoji}</span>
                <div>
                  <div>{selectedPlant.name}</div>
                  <Badge className="mt-1" style={{ backgroundColor: selectedPlant.categoryColor }}>
                    Level {selectedPlant.level}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription className="capitalize">{selectedPlant.category} wellness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to Level {selectedPlant.level + 1}</span>
                  <span className="font-semibold">{selectedPlant.currentXp}/{selectedPlant.xpToNext} XP</span>
                </div>
                <Progress value={selectedPlant.progress} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-warning/10 rounded-lg text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold">{selectedPlant.streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{selectedPlant.currentXp}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => waterPlant(selectedPlant.id)}
                  className="flex-1"
                  style={{ backgroundColor: selectedPlant.categoryColor }}
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Water Plant (+10 XP)
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedPlant(null)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MoodGarden;