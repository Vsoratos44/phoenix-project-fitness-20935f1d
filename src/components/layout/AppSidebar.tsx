/**
 * Phoenix Project Fitness - Main Application Sidebar
 * 
 * Comprehensive navigation for all 8 microservices:
 * 1. Dashboard & Analytics
 * 2. Workout Logging & Training
 * 3. Exercise Library & Content
 * 4. Nutrition Tracking
 * 5. Social & Community
 * 6. Rewards & Achievements
 * 7. Profile & Settings
 * 8. Marketplace
 */

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Calendar,
  Camera,
  Dumbbell,
  Heart,
  Home,
  Library,
  Medal,
  Settings,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Utensils,
  Trophy,
  Watch,
  Zap,
  PlayCircle,
  Timer,
  Flame
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Define all navigation sections and their routes
const navigationSections = [
  {
    label: "Dashboard",
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Phoenix Score", url: "/phoenix-score", icon: Target },
    ]
  },
  {
    label: "Training",
    items: [
      { title: "Workouts", url: "/workouts", icon: Dumbbell },
      { title: "Exercise Library", url: "/exercises", icon: Library },
      { title: "AI Workout Generator", url: "/ai-workouts", icon: Zap },
      { title: "Programs", url: "/programs", icon: Calendar },
      { title: "Active Session", url: "/workout-session", icon: PlayCircle },
    ]
  },
  {
    label: "Health & Nutrition",
    items: [
      { title: "Nutrition", url: "/nutrition", icon: Utensils },
      { title: "Biometrics", url: "/biometrics", icon: Heart },
      { title: "Progress Photos", url: "/progress", icon: Camera },
    ]
  },
  {
    label: "Social & Community", 
    items: [
      { title: "Community", url: "/community", icon: Users },
      { title: "Challenges", url: "/challenges", icon: Trophy },
      { title: "Leaderboards", url: "/leaderboards", icon: TrendingUp },
    ]
  },
  {
    label: "Rewards & Shop",
    items: [
      { title: "Achievements", url: "/achievements", icon: Medal },
      { title: "SEP Points", url: "/points", icon: Flame },
      { title: "Marketplace", url: "/marketplace", icon: ShoppingCart },
    ]
  },
  {
    label: "Profile",
    items: [
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Activity Feed", url: "/activity", icon: Activity },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Helper functions for navigation state
  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
    const activeClasses = "bg-primary text-primary-foreground font-medium";
    const inactiveClasses = "hover:bg-accent hover:text-accent-foreground";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <Sidebar 
      className={`${collapsed ? "w-16" : "w-64"} border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
      collapsible="icon"
    >
      {/* Header with logo and collapse trigger */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-fitness-orange flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Phoenix Fitness</span>
              <span className="text-xs text-muted-foreground">v2.1</span>
            </div>
          </div>
        )}
        <SidebarTrigger className="h-6 w-6" />
      </div>

      <SidebarContent className="px-2 py-4">
        {navigationSections.map((section) => (
          <SidebarGroup key={section.label} className="mb-4">
            {!collapsed && (
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent className="mt-2">
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClasses(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {isActive(item.url) && (
                              <div className="h-2 w-2 rounded-full bg-fitness-green-electric animate-pulse" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Quick Stats in Sidebar (when expanded) */}
        {!collapsed && (
          <div className="mt-auto p-3 border-t border-border/40">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">5 workouts</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">SEP Points</span>
                <span className="font-medium text-fitness-orange">1,245</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div className="bg-fitness-green-electric h-1.5 rounded-full w-3/4" />
              </div>
              <p className="text-xs text-muted-foreground">Weekly goal: 75%</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}