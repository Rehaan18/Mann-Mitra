import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Headphones, FileText, Dumbbell, Star, Clock, ExternalLink } from "lucide-react";

type ResourceType = "all" | "video" | "audio" | "article" | "exercise";

const resources = [
  {
    id: 1,
    type: "video" as const,
    title: "Understanding Anxiety: A Student's Guide",
    duration: "12 min",
    rating: 4.8,
    topic: "Stress",
    description: "Learn about anxiety symptoms and coping strategies designed for students.",
    url: "https://www.mcleanhospital.org/video/what-anxiety",
    source: "McLean Hospital",
  },
  {
    id: 2,
    type: "audio" as const,
    title: "Guided Meditation for Sleep",
    duration: "15 min",
    rating: 4.9,
    topic: "Sleep",
    description: "Calming guided meditation to help you wind down and fall asleep peacefully.",
    url: "https://www.uclahealth.org/uclamindful/guided-meditations",
    source: "UCLA Mindful",
  },
  {
    id: 3,
    type: "article" as const,
    title: "Managing Academic Stress",
    duration: "8 min read",
    rating: 4.6,
    topic: "Stress",
    description: "Practical tips for handling academic pressure, deadlines and exam anxiety.",
    url: "https://www.helpguide.org/mental-health/stress",
    source: "HelpGuide.org",
  },
  {
    id: 4,
    type: "exercise" as const,
    title: "Progressive Muscle Relaxation",
    duration: "10 min",
    rating: 4.7,
    topic: "Mindfulness",
    description: "Step-by-step guided exercise to release physical tension and calm your mind.",
    url: "https://www.helpguide.org/mental-health/meditation/progressive-muscle-relaxation-meditation",
    source: "HelpGuide.org",
  },
  {
    id: 5,
    type: "video" as const,
    title: "3 Secrets of Resilient People",
    duration: "16 min",
    rating: 4.8,
    topic: "Mindfulness",
    description: "TED Talk by resilience researcher Lucy Hone on bouncing back from adversity.",
    url: "https://www.ted.com/talks/lucy_hone_3_secrets_of_resilient_people",
    source: "TED",
  },
  {
    id: 6,
    type: "audio" as const,
    title: "Focus & Concentration Study Sounds",
    duration: "∞ Live",
    rating: 4.5,
    topic: "Study",
    description: "Ambient lofi sounds designed to enhance focus during long study sessions.",
    url: "https://www.lofi.cafe",
    source: "Lofi Cafe",
  },
  {
    id: 7,
    type: "article" as const,
    title: "Relaxation Techniques for Stress Relief",
    duration: "10 min read",
    rating: 4.7,
    topic: "Stress",
    description: "Deep breathing, body scan, and visualization techniques to relieve stress.",
    url: "https://www.helpguide.org/mental-health/stress/relaxation-techniques-for-stress-relief",
    source: "HelpGuide.org",
  },
  {
    id: 8,
    type: "video" as const,
    title: "Anxiety Videos & Resources Library",
    duration: "Various",
    rating: 4.6,
    topic: "Anxiety",
    description: "A full library of short videos on managing anxiety, OCD and related topics.",
    url: "https://www.anxietycanada.com/resources/video-resources/",
    source: "Anxiety Canada",
  },
  {
    id: 9,
    type: "exercise" as const,
    title: "Mindful Breathing Meditation",
    duration: "5 min",
    rating: 4.8,
    topic: "Mindfulness",
    description: "A quick guided breathing exercise to reset when you're feeling overwhelmed.",
    url: "https://www.helpguide.org/mental-health/meditation/mindful-breathing-meditation",
    source: "HelpGuide.org",
  },
];

const typeIcons = {
  video: Video,
  audio: Headphones,
  article: FileText,
  exercise: Dumbbell,
};

const buttonLabel: Record<string, string> = {
  video: "Watch",
  audio: "Listen",
  article: "Read",
  exercise: "Start",
};

const Resources = () => {
  const [selectedType, setSelectedType] = useState<ResourceType>("all");

  const filteredResources =
    selectedType === "all"
      ? resources
      : resources.filter((r) => r.type === selectedType);

  const openResource = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Mental Health Resources</h1>
        <p className="text-muted-foreground">
          Curated mental health resources from trusted sources to support your well-being.
        </p>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All Types", icon: null },
          { key: "video", label: "Videos", icon: Video },
          { key: "audio", label: "Audio", icon: Headphones },
          { key: "article", label: "Articles", icon: FileText },
          { key: "exercise", label: "Exercises", icon: Dumbbell },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={selectedType === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(key as ResourceType)}
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {label}
          </Button>
        ))}
      </div>

      {/* Resource cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const Icon = typeIcons[resource.type];
          return (
            <Card key={resource.id} className="flex flex-col hover:border-garden-blue/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-garden-blue" />
                    <Badge variant="secondary" className="capitalize">
                      {resource.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 bg-warning/20 px-2 py-1 rounded-md">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="text-xs font-medium text-warning">{resource.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-snug">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{resource.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{resource.topic}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Source: {resource.source}</p>
                <Button
                  className="w-full gap-2"
                  onClick={() => openResource(resource.url)}
                >
                  {buttonLabel[resource.type]}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-muted rounded-xl p-4 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Disclaimer:</strong> These resources are from trusted mental health organisations and are for educational purposes only. They are not a substitute for professional mental health care. If you are in crisis, please contact iCall: <strong className="text-foreground">9152987821</strong> or book a session with one of our counsellors.
        </p>
      </div>
    </div>
  );
};

export default Resources;
