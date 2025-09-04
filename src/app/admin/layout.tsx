import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r">
        <AdminSidebar />
      </div>
      <div className="md:pl-64 flex-1">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}