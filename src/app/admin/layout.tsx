'use client';

import { AdminSidebar } from '@/components/AdminSidebar';
import { MobileAdminSidebar } from '@/components/MobileAdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-slate-700">
        <AdminSidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileAdminSidebar />
      
      {/* Main Content */}
      <div className="md:pl-64 flex-1 w-full min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}