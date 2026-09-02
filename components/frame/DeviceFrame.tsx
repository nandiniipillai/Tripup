'use client';

import { useRef, type ReactNode } from 'react';
import { StatusBar } from './StatusBar';
import { HomeIndicator } from './HomeIndicator';
import { DeviceFrameProvider } from './device-frame-context';

export function DeviceFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="landscape-block items-center justify-center h-dvh w-full text-center px-8" style={{ background: '#F4F4F5' }}>
        <p className="text-body" style={{ color: 'var(--muted-foreground)' }}>
          Rotate your device — TripUp is portrait-only.
        </p>
      </div>
      <div className="device-page">
        <div className="device-frame" ref={frameRef}>
          <DeviceFrameProvider frameRef={frameRef}>
            <div className="device-scroll">
              <StatusBar />
              <div className="flex-1 min-h-0 flex flex-col relative">
                {children}
              </div>
              <HomeIndicator />
            </div>
          </DeviceFrameProvider>
        </div>
      </div>
    </>
  );
}
