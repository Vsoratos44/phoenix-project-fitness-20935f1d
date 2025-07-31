import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProgramsPage() {
  const programs = [
    {
      id: 1,
      title: "8-Week Metabolic Hypertrophy",
      description: "Build lean muscle while burning fat with this scientifically-designed program",
      duration: "8 weeks",
      frequency: "4x/week",
      difficulty: "Intermediate",
      goal: "Lean Muscle & Fat Loss",
      phase: "Not Started"
    },
    {
      id: 2,
      title: "12-Week Lean Physique Sculpt",
      description: "Advanced high-volume program for maximum muscle growth and definition",
      duration: "12 weeks",
      frequency: "5x/week",
      difficulty: "Advanced",
      goal: "Muscle Hypertrophy",
      phase: "Active - Week 3"
    },
    {
      id: 3,
      title: "8-Week Progressive HIIT Overload",
      description: "Maximize fat loss and cardiovascular conditioning with progressive HIIT",
      duration: "8 weeks",
      frequency: "4x/week",
      difficulty: "Beginner-Advanced",
      goal: "Fat Loss & Cardio",
      phase: "Completed"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseColor = (phase: string) => {
    if (phase.includes('Active')) return 'bg-blue-500';
    if (phase === 'Completed') return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Training Programs</h1>
          <p className="text-muted-foreground">Structured workout programs designed by fitness experts</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">currently following</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">programs finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/5</div>
            <p className="text-xs text-muted-foreground">workouts completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
            <p className="text-xs text-muted-foreground">program completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Programs</h2>
        
        <div className="space-y-4">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{program.title}</CardTitle>
                    <CardDescription className="mt-2">{program.description}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getDifficultyColor(program.difficulty)}>
                      {program.difficulty}
                    </Badge>
                    <Badge className={getPhaseColor(program.phase)}>
                      {program.phase}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{program.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p className="font-medium">{program.frequency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Goal</p>
                      <p className="font-medium">{program.goal}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {program.phase === 'Not Started' && (
                      <Button>Start Program</Button>
                    )}
                    {program.phase.includes('Active') && (
                      <>
                        <Button variant="outline">View Progress</Button>
                        <Button>Continue</Button>
                      </>
                    )}
                    {program.phase === 'Completed' && (
                      <Button variant="outline">Restart</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}