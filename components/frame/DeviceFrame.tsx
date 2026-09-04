'use client';

import { useRef, type ReactNode } from 'react';
import { StatusBar } from './StatusBar';
import { HomeIndicator } from './HomeIndicator';
import { DeviceFrameProvider } from './device-frame-context';
import { Toaster } from '@/components/ui/sonner';

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
            {/* Sonner isn't portalled (unlike Sheet/Dialog/Popover, which use
                the device-frame-context `container` pattern) — it renders
                position:fixed in place in the tree. Rendering it here, as a
                DOM child of .device-frame, is what bounds it: .device-frame
                already carries `transform: translateZ(0)` specifically to
                give position:fixed descendants a containing block at the
                390x844 frame instead of the browser viewport (see its
                comment in globals.css). Previously Toaster sat in
                app/layout.tsx as a sibling of <DeviceFrame>, outside that
                containing block, so toasts rendered full-viewport-width on
                desktop instead of inside the phone bezel. */}
            <Toaster position="bottom-center" duration={2600} />
          </DeviceFrameProvider>
        </div>
      </div>
    </>
  );
}
