import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RequestStyleForm } from '@/components/request-style/RequestStyleForm';

export const metadata: Metadata = {
  title: 'Request a Style',
};

export const dynamic = 'force-dynamic';

export default async function RequestStylePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/request-style');
  }

  return <RequestStyleForm />;
}
