import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MeasureFlow } from '@/components/measure/MeasureFlow';

export const metadata: Metadata = {
  title: 'Get Your Measurements — Stitch-It',
  description: 'Take two photos and get your body measurements estimated for tailoring.',
};

export const dynamic = 'force-dynamic';

export default async function MeasurePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/measure');
  }

  return <MeasureFlow />;
}
