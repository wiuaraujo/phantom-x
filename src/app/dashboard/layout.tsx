"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileAppNav } from "@/components/dashboard/MobileAppNav";
import { DashboardNavProvider } from "@/components/dashboard/DashboardNavContext";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = auth.getSession();
    if (!session) {
      router.push("/login");
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <DashboardNavProvider>
      <div className="min-h-screen bg-brand-black text-brand-white flex font-sans">
        {/* Desktop Sidebar (hidden on mobile, visible on lg+) */}
        <Sidebar />

        {/* Main Content Area (with pb-20 on mobile to leave space for bottom bar) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 lg:pb-0">
          <EmailVerificationBanner />
          {children}
        </div>

        {/* Mobile Native App Bottom Navigation Bar & Drawer (< lg) */}
        <MobileAppNav />
      </div>
    </DashboardNavProvider>
  );
}
