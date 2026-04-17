// ---------------------------------------------------------------
// Root Layout  –  src/app/layout.tsx
// ---------------------------------------------------------------
// Every Next.js app needs a root layout.  It wraps every page
// with the <html> and <body> tags.  Think of it like a shared
// template that all pages inherit.
// ---------------------------------------------------------------

import type { Metadata } from "next";

// ----- Page metadata (shows in the browser tab) -----
export const metadata: Metadata = {
  title: "Note Saver",
  description: "A simple Next.js app that saves notes via an API route.",
};

// ----- The layout component -----
// `children` is whatever page Next.js is currently rendering.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
