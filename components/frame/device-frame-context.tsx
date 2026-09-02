'use client';

// Sheets/dialogs/popovers portal into document.body by default, which would
// escape the fixed 390x844 device frame and render full-viewport-width on
// desktop. This context exposes the frame's DOM node so every portal-based
// shadcn primitive (Sheet, Dialog, Popover) can be told to render inside the
// frame instead — see components/ui/{sheet,dialog,popover}.tsx.

import { createContext, useContext, type ReactNode, type RefObject } from 'react';

const DeviceFrameContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function DeviceFrameProvider({
  frameRef, children,
}: { frameRef: RefObject<HTMLElement | null>; children: ReactNode }) {
  return <DeviceFrameContext.Provider value={frameRef}>{children}</DeviceFrameContext.Provider>;
}

export function useDeviceFrameRef(): RefObject<HTMLElement | null> | undefined {
  return useContext(DeviceFrameContext) ?? undefined;
}
