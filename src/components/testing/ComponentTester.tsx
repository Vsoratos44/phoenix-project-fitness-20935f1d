/**
 * Component Tester - Interactive testing environment for Phoenix components
 * Inspired by Storybook but integrated into the Phoenix ecosystem
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { EnhancedProgress } from "@/components/ui/enhanced-progress";
import { 
  Code2, 
  Play, 
  Palette, 
  Settings, 
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Zap,
  Heart,
  Activity,
  Target
} from "lucide-react";

// Test component examples
const TestComponents = {
  buttons: [
    { variant: "default" as const, children: "Primary Button" },
    { variant: "secondary" as const, children: "Secondary Button" },
    { variant: "outline" as const, children: "Outline Button" },
    { variant: "hero" as const, children: "Hero Button" },
    { variant: "fitness" as const, children: "Fitness Button" },
  ],
  
  progress: [
    { value: 25, variant: "default" as const, label: "Default Progress" },
    { value: 50, variant: "success" as const, label: "Success Progress", showGlow: true },
    { value: 75, variant: "warning" as const, label: "Warning Progress" },
    { value: 90, variant: "error" as const, label: "Error Progress" },
  ],

  badges: [
    { variant: "default" as const, children: "Default" },
    { variant: "secondary" as const, children: "Secondary" },
    { variant: "outline" as const, children: "Outline" },
    { variant: "destructive" as const, children: "Destructive" },
  ],
};

interface ViewportSize {
  name: string;
  width: number;
  icon: React.ComponentType<{ className?: string }>;
}

const viewportSizes: ViewportSize[] = [
  { name: "Mobile", width: 375, icon: Smartphone },
  { name: "Tablet", width: 768, icon: Tablet },
  { name: "Desktop", width: 1024, icon: Monitor },
];

export function ComponentTester() {
  const [selectedViewport, setSelectedViewport] = useState(viewportSizes[2]);
  const [darkMode, setDarkMode] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [testData, setTestData] = useState({
    buttonText: "Test Button",
    progressValue: 65,
    cardTitle: "Test Card",
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Component Tester</h1>
            <p className="text-muted-foreground">
              Interactive testing environment for Phoenix Fitness components
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Viewport Size Selector */}
            <div className="flex items-center space-x-2">
              {viewportSizes.map((viewport) => {
                const Icon = viewport.icon;
                return (
                  <Button
                    key={viewport.name}
                    variant={selectedViewport.name === viewport.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedViewport(viewport)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{viewport.name}</span>
                  </Button>
                );
              })}
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
        </div>

        {/* Testing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="button-text">Button Text</Label>
                  <Input
                    id="button-text"
                    value={testData.buttonText}
                    onChange={(e) => setTestData(prev => ({
                      ...prev,
                      buttonText: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label>Progress Value: {testData.progressValue}%</Label>
                  <Slider
                    value={[testData.progressValue]}
                    onValueChange={(value) => setTestData(prev => ({
                      ...prev,
                      progressValue: value[0]
                    }))}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="card-title">Card Title</Label>
                  <Input
                    id="card-title"
                    value={testData.cardTitle}
                    onChange={(e) => setTestData(prev => ({
                      ...prev,
                      cardTitle: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label>Animation Speed: {animationSpeed[0]}x</Label>
                  <Slider
                    value={animationSpeed}
                    onValueChange={setAnimationSpeed}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Component Stats */}
            <div className="space-y-3">
              <StatCard
                title="Components"
                value="24"
                icon={Code2}
                color="primary"
              />
              <StatCard
                title="Variants"
                value="56"
                icon={Palette}
                color="fitness-orange"
              />
              <StatCard
                title="Tests"
                value="89"
                icon={Play}
                color="fitness-green"
              />
            </div>
          </div>

          {/* Component Preview */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <CardTitle>Component Preview</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {selectedViewport.width}px
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="components" className="h-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="layouts">Layouts</TabsTrigger>
                    <TabsTrigger value="animations">Animations</TabsTrigger>
                    <TabsTrigger value="themes">Themes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="components" className="space-y-6 mt-6">
                    {/* Buttons Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Buttons</h3>
                      <div className="flex flex-wrap gap-3">
                        {TestComponents.buttons.map((props, index) => (
                          <Button key={index} {...props}>
                            {testData.buttonText}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Progress Indicators</h3>
                      <div className="space-y-3">
                        {TestComponents.progress.map((props, index) => (
                          <div key={index} className="space-y-2">
                            <Label>{props.label}</Label>
                            <EnhancedProgress 
                              {...props} 
                              value={testData.progressValue}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Badges Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Badges</h3>
                      <div className="flex flex-wrap gap-2">
                        {TestComponents.badges.map((props, index) => (
                          <Badge key={index} {...props} />
                        ))}
                      </div>
                    </div>

                    {/* Cards Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Cards</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>{testData.cardTitle}</CardTitle>
                            <CardDescription>
                              This is a test card component with customizable content.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <EnhancedProgress 
                                value={testData.progressValue} 
                                showGlow={true}
                                variant="success"
                              />
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Progress</span>
                                <span className="font-medium">{testData.progressValue}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-primary/5 to-fitness-orange/5 border-primary/20">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Zap className="h-5 w-5 text-fitness-orange" />
                              <span>Fitness Card</span>
                            </CardTitle>
                            <CardDescription>
                              Enhanced card with fitness theme styling.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <Activity className="h-6 w-6 mx-auto text-primary mb-1" />
                                <p className="text-sm font-medium">Active</p>
                              </div>
                              <div>
                                <Heart className="h-6 w-6 mx-auto text-red-500 mb-1" />
                                <p className="text-sm font-medium">Health</p>
                              </div>
                              <div>
                                <Target className="h-6 w-6 mx-auto text-fitness-green mb-1" />
                                <p className="text-sm font-medium">Goals</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="layouts" className="mt-6">
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">Layout Testing</h3>
                      <p className="text-muted-foreground">
                        Responsive layout components and grid systems
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="animations" className="mt-6">
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">Animation Testing</h3>
                      <p className="text-muted-foreground">
                        Interactive animation and transition testing
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="themes" className="mt-6">
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">Theme Testing</h3>
                      <p className="text-muted-foreground">
                        Color schemes and theme variations
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}