/**
 * Phoenix Project Fitness - Main Application Layout
 * 
 * Provides the foundational layout structure with:
 * - Responsive sidebar navigation
 * - Mobile-first design
 * - Global header with notifications
 * - Progressive Web App optimizations
 */

import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Global Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
              {/* Left side - Sidebar trigger (mobile) and search */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises, workouts..."
                    className="w-[300px] pl-10"
                  />
                </div>
              </div>

              {/* Right side - User actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-fitness-orange text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
                
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}