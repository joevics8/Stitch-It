'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, User as UserIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const LINKS: { label: string; href: string }[] = [
  { label: 'My Measurements', href: '/measurements' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms and Condition', href: '/terms' },
];

export function ProfileView({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const fullName = (user.user_metadata?.full_name as string) || user.email || 'Your account';

  return (
    <div className="max-w-md mx-auto px-4 py-10 pb-32">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-16 w-16 rounded-full bg-[hsl(var(--verified))]/10 flex items-center justify-center mb-3">
          <UserIcon className="h-7 w-7 text-[hsl(var(--verified))]" />
        </div>
        <p className="font-serif text-xl font-semibold">{fullName}</p>
        {user.email && <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>}
      </div>

      <div className="rounded-sm border border-border divide-y divide-border overflow-hidden mb-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors"
          >
            {link.label}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full rounded-sm border border-[hsl(var(--rust))]/30 text-[hsl(var(--rust))] text-sm font-semibold py-3.5 hover:bg-[hsl(var(--rust))]/5 transition-colors"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
}
