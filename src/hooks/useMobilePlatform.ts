import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type PlatformType = 'web' | 'ios' | 'android';

export const useMobilePlatform = () => {
  const [platform, setPlatform] = useState<PlatformType>('web');
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const currentPlatform = Capacitor.getPlatform() as PlatformType;
    setPlatform(currentPlatform);
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  return {
    platform,
    isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
};