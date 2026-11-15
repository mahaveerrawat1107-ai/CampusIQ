import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { AssignmentsProvider } from "@/context/AssignmentsContext";
import { NotesProvider } from "@/context/NotesContext";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusIQ — The Student Academic Workspace",
  description:
    "A clean, focused academic productivity workspace for college students. Track attendance, assignments, and notes in one place.",
};

export const viewport: Viewport = {
  themeColor: "#F7F8FC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="min-h-screen bg-background font-sans text-navy antialiased">
        <AttendanceProvider>
          <AssignmentsProvider>
            <NotesProvider>
              <AppShell>{children}</AppShell>
            </NotesProvider>
          </AssignmentsProvider>
        </AttendanceProvider>
      </body>
    </html>
  );
}
