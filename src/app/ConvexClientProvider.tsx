"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { DarkModeProvider } from "@/context/DarkModeContext";

// Production Convex deployment - hardcoded to ensure it works in all environments
const PRODUCTION_CONVEX_URL = "https://tidy-salamander-925.eu-west-1.convex.cloud";
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || PRODUCTION_CONVEX_URL;

if (!convexUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_CONVEX_URL is not set. The app will fail to load Convex queries."
  );
}

const client = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <DarkModeProvider>
      {children}
    </DarkModeProvider>
  );

  if (!client) return content;
  return <ConvexProvider client={client}>{content}</ConvexProvider>;
}
