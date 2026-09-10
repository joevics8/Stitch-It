import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/');

  return (
    <div>
      <div className="border-b border-border bg-[hsl(var(--ink))] text-[hsl(var(--paper))]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-serif font-semibold">Stitch-It Admin</span>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin/styles" className="hover:text-[hsl(var(--seal))] transition-colors">
              Styles
            </Link>
            <Link href="/admin/orders" className="hover:text-[hsl(var(--seal))] transition-colors">
              Orders
            </Link>
            <Link href="/admin/style-requests" className="hover:text-[hsl(var(--seal))] transition-colors">
              Style Requests
            </Link>
            <Link href="/" className="hover:text-[hsl(var(--seal))] transition-colors ml-auto">
              &larr; Back to site
            </Link>
          </nav>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 pb-20">{children}</div>
    </div>
  );
}
