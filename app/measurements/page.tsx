import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MeasurementCard } from '@/components/measurements/MeasurementCard';
import type { MeasurementProfile } from '@/lib/measurements';

export const metadata: Metadata = {
  title: 'Size Measurements',
};

export const dynamic = 'force-dynamic';

export default async function MeasurementsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/measurements');
  }

  const { data: profiles } = await supabase
    .from('measurement_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const items = (profiles ?? []) as MeasurementProfile[];

  return (
    <div className="max-w-lg mx-auto px-4 py-10 pb-32">
      <h1 className="font-serif text-3xl font-semibold mb-8">Size Measurements</h1>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border p-8 text-center mb-8">
          <p className="text-sm text-muted-foreground">
            You haven&rsquo;t saved any measurements yet. Take two photos or enter them manually
            to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {items.map((profile) => (
            <MeasurementCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      <Link
        href="/measure"
        className="block w-full text-center rounded-sm bg-[hsl(var(--verified))] text-white font-semibold py-3.5 mb-3 hover:opacity-90 transition-opacity"
      >
        Create New Measurements
      </Link>
      <Link
        href="/measurements/manual"
        className="block w-full text-center rounded-sm border border-border font-semibold py-3.5 hover:border-[hsl(var(--verified))] hover:text-[hsl(var(--verified))] transition-colors"
      >
        Enter Measurements Manually
      </Link>
    </div>
  );
}
