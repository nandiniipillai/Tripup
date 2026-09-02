import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DeviceFrame } from "@/components/frame/DeviceFrame";
import { Toaster } from "@/components/ui/sonner";

// No webfont. §5.1 pins the system stack (--font-app) as one of the two
// deliberate swap points for the designer's restyle; the Plus Jakarta face
// that used to load here existed only for the removed logo lockup.

export const metadata: Metadata = {
  title: "TripUp",
  description: "Plan the trip, decide together, settle up in-app.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full">
        <DeviceFrame>{children}</DeviceFrame>
        <Toaster position="bottom-center" duration={2600} />
      </body>
    </html>
  );
}
