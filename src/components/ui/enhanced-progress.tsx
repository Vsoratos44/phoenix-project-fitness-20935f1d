import * as React from "react";
import { cn } from "@/lib/utils";

interface EnhancedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showGlow?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

const EnhancedProgress = React.forwardRef<HTMLDivElement, EnhancedProgressProps>(
  ({ className, value = 0, max = 100, showGlow = false, variant = "default", size = "md", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4"
    };
    
    const variantClasses = {
      default: "bg-primary",
      success: "bg-fitness-green-electric",
      warning: "bg-fitness-orange",
      error: "bg-destructive"
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-secondary/30",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all duration-700 ease-out",
            variantClasses[variant],
            showGlow && "shadow-lg animate-pulse-glow"
          )}
          style={{
            transform: `translateX(-${100 - percentage}%)`
          }}
        />
        {/* Animated shine effect */}
        <div 
          className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
          style={{
            transform: `translateX(${percentage * 4}px)`
          }}
        />
      </div>
    );
  }
);

EnhancedProgress.displayName = "EnhancedProgress";

export { EnhancedProgress };