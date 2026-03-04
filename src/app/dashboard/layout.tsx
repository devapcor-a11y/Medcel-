import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileNavbar from '@/components/dashboard/MobileNavbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        <div className="w-full min-w-0 flex-1 overflow-auto p-4 pb-20 md:p-8 md:pb-8">
          <div className="mx-auto w-full min-w-0 max-w-6xl">{children}</div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavbar />
      </main>
    </div>
  );
}
