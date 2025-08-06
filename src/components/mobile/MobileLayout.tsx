import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { isNative, isIOS } = useMobilePlatform();

  useEffect(() => {
    if (isNative) {
      // Set status bar style for mobile
      StatusBar.setStyle({ style: Style.Dark });
      
      if (isIOS) {
        StatusBar.setBackgroundColor({ color: '#ffffff' });
      }
    }
  }, [isNative, isIOS]);

  const handleMobileInteraction = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  if (!isNative) {
    return <>{children}</>;
  }

  return (
    <div 
      className="min-h-screen bg-background mobile-layout"
      onClick={handleMobileInteraction}
    >
      {/* Mobile-specific header */}
      <div className="h-safe-area-top bg-background" />
      
      {/* Main content */}
      <div className="flex-1 pb-safe-area-bottom">
        {children}
      </div>
    </div>
  );
};