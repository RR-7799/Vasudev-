import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vasudev 1.0 — Filmmaking Workspace",
  description: "Write, plan and make your film.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}